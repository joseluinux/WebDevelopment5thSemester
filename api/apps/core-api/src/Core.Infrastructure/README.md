# Core.Infrastructure

The persistence layer. Provides concrete implementations of the repository interfaces defined in `Core.Domain`, backed by Entity Framework Core and a PostgreSQL database hosted on Supabase.

Depends on: `Core.Domain`, `Core.Application` (for entity types), EF Core, Npgsql.

```
Core.Infrastructure/
└── Persistence/
    ├── AppDbContext.cs
    ├── Migrations/
    │   └── 20260509191608_AddRefreshTokens.cs  ← adds the refresh_tokens table
    └── Repositories/
        ├── UserRepository.cs
        └── RefreshTokenRepository.cs
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

### `refresh_tokens` model configuration

- `token` column has a unique index — lookups by opaque string are O(log n) and duplicate tokens are impossible at the DB level.
- `user_id` is indexed and carries `ON DELETE CASCADE` — deleting a user removes all their refresh tokens.
- `is_revoked` defaults to `false`; `created_at` defaults to `CURRENT_TIMESTAMP`.
- Rows are never physically deleted (soft revoke only).

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

## `Persistence/Repositories/UserRepository`

Implements `IUserRepository` (defined in `Core.Domain.Interfaces`).

| Method | EF operation |
|---|---|
| `GetByEmailAsync` | `FirstOrDefaultAsync` — returns `null` when not found, matching the nullable contract |
| `GetByIdAsync` | `FindAsync` — checks the EF change tracker before issuing SQL; returns `null` when the row does not exist |
| `AddAsync` | `AddAsync` + `SaveChangesAsync` — stages and flushes in a single transaction |

`FindAsync` is preferred over `FirstOrDefaultAsync(u => u.Id == id)` for primary-key lookups because it avoids a round-trip when the entity is already tracked in the same DbContext scope (e.g. earlier in the same request).

The repository takes `AppDbContext` via constructor injection. It never returns EF-tracked objects outside its own methods — callers in `Core.Application` receive plain entity instances.

---

## Migrations

The schema was originally scaffolded from Supabase (no prior migration baseline). The first migration `AddRefreshTokens` adds only the `refresh_tokens` table — the Up/Down methods were trimmed to exclude the existing Supabase tables that would fail if re-created. The model snapshot is left intact so future migrations compute correct deltas.

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

---

## Adding a New Repository

1. Define the interface in `Core.Domain/Interfaces/I<Entity>Repository.cs`.
2. Create `Core.Infrastructure/Persistence/Repositories/<Entity>Repository.cs` implementing that interface.
3. Register the binding in `CoreApi/Program.cs`:
   ```csharp
   builder.Services.AddScoped<I<Entity>Repository, <Entity>Repository>();
   ```
