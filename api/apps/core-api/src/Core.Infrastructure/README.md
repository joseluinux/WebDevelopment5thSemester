# Core.Infrastructure

The persistence layer. Provides concrete implementations of the repository interfaces defined in `Core.Domain`, backed by Entity Framework Core and a PostgreSQL database hosted on Supabase.

Depends on: `Core.Domain`, `Core.Application` (for entity types), EF Core, Npgsql.

```
Core.Infrastructure/
├── Persistence/
│   ├── AppDbContext.cs
│   ├── Migrations/
│   │   ├── 20260509191608_AddRefreshTokens.cs        ← adds the refresh_tokens table
│   │   └── 20260511195950_AddPasswordResetTokens.cs  ← adds the password_reset_tokens table
│   └── Repositories/
│       ├── UserRepository.cs
│       ├── RefreshTokenRepository.cs
│       ├── PasswordResetTokenRepository.cs
│       ├── MeiRepository.cs
│       ├── EmployeeRepository.cs
│       ├── TransactionRepository.cs
│       └── ProductRepository.cs
└── Services/
    ├── ResendEmailService.cs   ← IEmailService implementation (Resend SDK)
    └── ResendSettings.cs       ← POCO bound to the "Resend" appsettings section
```

---

## `Persistence/AppDbContext`

`AppDbContext` is the EF Core unit-of-work. It maps every domain entity to its PostgreSQL table and configures column names, constraints, indexes, and default values to match the Supabase schema.

### DbSets

| Property | Table |
|---|---|
| `Users` | `users` |
| `Meis` | `meis` |
| `Employees` | `employees` |
| `Products` | `products` |
| `Transactions` | `transactions` |
| `Imports` | `imports` |
| `Documents` | `documents` |
| `AiRecommendations` | `ai_recommendations` |
| `RefreshTokens` | `refresh_tokens` |
| `PasswordResetTokens` | `password_reset_tokens` |

### `refresh_tokens` model configuration

- `token` column has a unique index — lookups by opaque string are O(log n) and duplicate tokens are impossible at the DB level.
- `user_id` is indexed and carries `ON DELETE CASCADE` — deleting a user removes all their refresh tokens.
- `is_revoked` defaults to `false`; `created_at` defaults to `CURRENT_TIMESTAMP`.
- Rows are never physically deleted (soft revoke only).

### `password_reset_tokens` model configuration

- `token` column has a unique index (`password_reset_tokens_token_key`) — same rationale as `refresh_tokens.token`.
- `user_id` is indexed and carries `ON DELETE CASCADE` — deleting a user removes all their reset tokens.
- `is_used` defaults to `false`; `created_at` defaults to `CURRENT_TIMESTAMP`.
- Rows are never physically deleted — keeping them enables audit trails and detection of replay attempts.

### Notable model configuration

- All primary keys use `uuid_generate_v4()` as the database default (PostgreSQL `uuid-ossp` extension).
- `Transactions.import_id` has `ON DELETE SET NULL` — deleting an `Import` orphans its transactions rather than cascading.
- `users.email` and `meis.cnpj` carry unique constraints enforced both at the database level and via domain exceptions.
- Supabase platform enums (`auth.*`, `realtime.*`, `storage.*`) are registered via `HasPostgresEnum` so EF Core is aware of them without mapping them to C# types.
- `AppContext.SetSwitch("Npgsql.EnableLegacyTimestampBehavior", true)` is set in `CoreApi/Program.cs` to keep `DateTime` columns working with `timestamp without time zone` columns.

---

## `Persistence/Repositories/RefreshTokenRepository`

Implements `IRefreshTokenRepository`.

| Method | EF operation |
|---|---|
| `AddAsync` | `AddAsync` + `SaveChangesAsync` — flush immediately; the token must exist in the DB before the client receives it |
| `GetByTokenAsync` | `FirstOrDefaultAsync` on the unique-indexed `token` column |
| `RevokeAsync` | Sets `IsRevoked = true`, calls `Update` (idempotent if already tracked), then `SaveChangesAsync` — row is kept for audit and reuse-detection |

---

## `Persistence/Repositories/MeiRepository`

Implements `IMeiRepository`.

| Method | EF operation | Notes |
|---|---|---|
| `GetAllByUserIdAsync` | `AsNoTracking().Where(...).ToListAsync` | `AsNoTracking` — results go straight to the wire, never mutated |
| `GetByIdAsync` | `FindAsync` | Change-tracker aware; entity is returned tracked so `UpdateAsync` callers can mutate it without re-attaching |
| `AddAsync` | `AddAsync` + `SaveChangesAsync` | |
| `UpdateAsync` | `Update` + `SaveChangesAsync` | Idempotent — works whether entity is tracked or detached |
| `DeleteAsync` | Attach stub → `Remove` → `SaveChangesAsync` | Avoids a SELECT round-trip; cascade FKs handle dependent rows |

The stub-delete pattern: a `Mei { Id = id }` entity is attached (only the PK is populated) and immediately removed, so EF emits a `DELETE WHERE id = @id` without first fetching the row. This is safe because ownership is already verified by the application-layer handler before `DeleteAsync` is called.

---

## `Persistence/Repositories/ProductRepository`

Implements `IProductRepository`.

| Method | EF operation | Notes |
|---|---|---|
| `GetAllByMeiIdAsync` | `AsNoTracking().Where(…).OrderByDescending(…).ThenBy(…).ToListAsync` | Optional `status` filter chained only when non-null/non-empty. Sorted newest-first, then by name. |
| `GetByIdAsync` | `FindAsync` | Change-tracker aware; entity returned tracked so `UpdateProductHandler` can mutate it |
| `AddAsync` | `AddAsync` + `SaveChangesAsync` | |
| `UpdateAsync` | `Update` + `SaveChangesAsync` | Idempotent whether entity is tracked or detached |
| `DeleteAsync` | `FindAsync` → `Remove` → `SaveChangesAsync` | Same Find-then-Remove pattern as `TransactionRepository` — avoids a tracker conflict when the entity was already loaded by the handler in this scope |

---

## `Persistence/Repositories/TransactionRepository`

Implements `ITransactionRepository`.

| Method | EF operation | Notes |
|---|---|---|
| `GetAllByMeiIdAsync` | `AsNoTracking().Where(…).OrderByDescending(…).ToListAsync` | Chained optional `Where` predicates — each `null` filter is simply skipped; EF coalesces them into a single `WHERE` clause. Sorted newest date first, then by `CreatedAt` desc. |
| `GetByIdAsync` | `FindAsync` | Change-tracker aware; entity returned tracked so `UpdateAsync` can mutate and save without re-attaching |
| `AddAsync` | `AddAsync` + `SaveChangesAsync` | |
| `UpdateAsync` | `Update` + `SaveChangesAsync` | Idempotent whether entity is tracked or detached |
| `DeleteAsync` | `FindAsync` → `Remove` → `SaveChangesAsync` | Finds the entity first (reuses the instance already in the tracker if loaded earlier) to avoid a tracker conflict that would arise from attaching a stub alongside the already-tracked entity |

---

## `Persistence/Repositories/UserRepository`

Implements `IUserRepository` (defined in `Core.Domain.Interfaces`).

| Method | EF operation | Notes |
|---|---|---|
| `GetByEmailAsync` | `FirstOrDefaultAsync` | Returns `null` when not found, matching the nullable contract |
| `GetByIdAsync` | `FindAsync` | Checks the EF change tracker before issuing SQL; returns `null` when the row does not exist |
| `AddAsync` | `AddAsync` + `SaveChangesAsync` | Stages and flushes in a single transaction |
| `UpdateAsync` | `Update` + `SaveChangesAsync` | Idempotent whether entity is tracked or detached |
| `DeleteAsync` | `FindAsync` → `Remove` → `SaveChangesAsync` | Find-then-Remove pattern (same rationale as `TransactionRepository`): `DeleteAccountHandler` loads the user earlier in the same scope, so attaching a fresh stub would throw a tracker conflict |

`FindAsync` is preferred over `FirstOrDefaultAsync(u => u.Id == id)` for primary-key lookups because it avoids a round-trip when the entity is already tracked in the same DbContext scope.

The repository takes `AppDbContext` via constructor injection. It never returns EF-tracked objects outside its own methods — callers in `Core.Application` receive plain entity instances.

---

---

## `Persistence/Repositories/PasswordResetTokenRepository`

Implements `IPasswordResetTokenRepository`.

| Method | EF operation | Notes |
|---|---|---|
| `AddAsync` | `AddAsync` + `SaveChangesAsync` | Flush immediately; the token must exist in DB before the email is sent |
| `GetByTokenAsync` | `FirstOrDefaultAsync` on the unique-indexed `token` column | Indexed seek |
| `MarkAsUsedAsync` | `FindAsync` → set `IsUsed = true` → `SaveChangesAsync` | Find-then-mutate pattern: `ResetPasswordHandler` already loaded the row via `GetByTokenAsync` in the same scope — attaching a stub would throw a tracker conflict |

Rows are never deleted (same audit/replay rationale as `RefreshTokenRepository`).

---

## `Persistence/Repositories/EmployeeRepository`

Implements `IEmployeeRepository`.

| Method | EF operation | Notes |
|---|---|---|
| `GetAllByMeiIdAsync` | `AsNoTracking().Where(…).OrderByDescending(…).ThenBy(…).ToListAsync` | `AsNoTracking` — results projected to a DTO, never mutated. Sorted newest first, then alphabetical by name |
| `GetByIdAsync` | `FindAsync` | Change-tracker aware; entity returned tracked so future Update handlers can mutate without re-attaching |
| `AddAsync` | `AddAsync` + `SaveChangesAsync` | |

---

## `Services/ResendEmailService`

Implements `IEmailService` (defined in `Core.Application.Interfaces`).

Wraps the Resend SDK (`IResend`) to send transactional email. Receives `ResendSettings` (bound from `appsettings.json → "Resend"`) for the `From` address.

Email content (HTML + text fallback) is built here, not in the handler — handlers should not render markup, and centralising the template makes branding/copy changes a one-file edit.

Subject and body are in Portuguese per the product's user-facing language (`pt-BR`). The handler call path: `ForgotPasswordHandler` → `IEmailService.SendPasswordResetEmailAsync` → `ResendEmailService` → `IResend.EmailSendAsync`.

---

## `Services/ResendSettings`

Plain POCO mirroring the `"Resend"` section of `appsettings.json`.

| Property | Description |
|---|---|
| `ApiKey` | Resend API key — passed to `ResendClientOptions.ApiToken` by the composition root |
| `FromEmail` | Sender address displayed to recipients (e.g. `noreply@lumemei.com.br`) |

---

## Migrations

The schema was originally scaffolded from Supabase (no prior migration baseline). Each migration adds only the new table — Up/Down methods are trimmed to exclude existing Supabase tables that would fail if re-created. The model snapshot is left intact so future migrations compute correct deltas.

| Migration | Adds |
|---|---|
| `20260509191608_AddRefreshTokens` | `refresh_tokens` table |
| `20260511195950_AddPasswordResetTokens` | `password_reset_tokens` table |

To apply:
```bash
dotnet ef database update -p src/Core.Infrastructure -s src/CoreApi
```

---

## Connection Setup

The connection string is read from `appsettings.json` under the key `ConnectionStrings:DefaultConnection`. For local development, override it in `appsettings.Development.json` (git-ignored).

```json
"ConnectionStrings": {
  "DefaultConnection": "Host=...;Database=...;Username=...;Password=..."
}
```

The Supabase connection string (Npgsql format) is available in the Supabase dashboard under **Project Settings → Database → Connection string → .NET**.

Email sending also requires a `"Resend"` section:

```json
"Resend": {
  "ApiKey": "re_...",
  "FromEmail": "noreply@lumemei.com.br"
}
```

For local development, override these in `appsettings.Development.json` (git-ignored).

---

## Adding a New Repository

1. Define the interface in `Core.Domain/Interfaces/I<Entity>Repository.cs`.
2. Create `Core.Infrastructure/Persistence/Repositories/<Entity>Repository.cs` implementing that interface.
3. Register the binding in `CoreApi/Program.cs`:
   ```csharp
   builder.Services.AddScoped<I<Entity>Repository, <Entity>Repository>();
   ```
