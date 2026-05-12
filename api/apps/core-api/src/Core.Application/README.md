# Core.Application

The use-case layer. Orchestrates domain objects to fulfil the application's business operations. Depends on `Core.Domain` (interfaces and entities) and has no knowledge of HTTP, databases, or any framework.

```
Core.Application/
├── Auth/
│   ├── JwtSettings.cs          ← strongly-typed POCO for JWT configuration
│   └── TokenFactory.cs         ← internal helper: JWT signing + CSPRNG refresh-token generation
├── DTOs/
│   └── ImportResponse.cs       ← strongly-typed mirror of the FastAPI /api/import/process response
├── Interfaces/
│   ├── IEmailService.cs        ← abstraction for transactional email
│   ├── IFastApiService.cs      ← abstraction for the FastAPI classification service
│   └── IStorageService.cs      ← abstraction for object storage (upload-and-get-URL)
└── UseCases/
    ├── Auth/
    │   ├── Register/
    │   │   ├── RegisterCommand.cs
    │   │   └── RegisterHandler.cs
    │   ├── Login/
    │   │   ├── LoginCommand.cs
    │   │   ├── LoginHandler.cs
    │   │   └── LoginResult.cs
    │   ├── GetMe/
    │   │   ├── GetMeQuery.cs
    │   │   ├── GetMeHandler.cs
    │   │   └── GetMeResult.cs
    │   ├── Refresh/
    │   │   ├── RefreshCommand.cs
    │   │   ├── RefreshHandler.cs
    │   │   └── RefreshResult.cs
    │   ├── Logout/
    │   │   ├── LogoutCommand.cs
    │   │   └── LogoutHandler.cs
    │   ├── ForgotPassword/
    │   │   ├── ForgotPasswordCommand.cs
    │   │   └── ForgotPasswordHandler.cs
    │   └── ResetPassword/
    │       ├── ResetPasswordCommand.cs
    │       └── ResetPasswordHandler.cs
    ├── Users/
    │   ├── GetProfile/
    │   │   ├── GetProfileQuery.cs
    │   │   ├── GetProfileHandler.cs
    │   │   └── GetProfileResult.cs     ← shared DTO for GET and PUT /v1/users/me
    │   ├── UpdateProfile/
    │   │   ├── UpdateProfileCommand.cs
    │   │   └── UpdateProfileHandler.cs
    │   └── DeleteAccount/
    │       ├── DeleteAccountCommand.cs
    │       └── DeleteAccountHandler.cs
    └── Meis/
        ├── MeiResult.cs            ← shared safe DTO for all MEI use cases
        ├── GetMeis/
        │   ├── GetMeisQuery.cs
        │   └── GetMeisHandler.cs
        ├── GetMei/
        │   ├── GetMeiQuery.cs
        │   └── GetMeiHandler.cs
        ├── CreateMei/
        │   ├── CreateMeiCommand.cs
        │   └── CreateMeiHandler.cs
        ├── UpdateMei/
        │   ├── UpdateMeiCommand.cs
        │   └── UpdateMeiHandler.cs
        └── DeleteMei/
            ├── DeleteMeiCommand.cs
            └── DeleteMeiHandler.cs
    └── Transactions/
        ├── TransactionResult.cs        ← shared safe DTO for all transaction use cases
        ├── GetTransactions/
        │   ├── GetTransactionsQuery.cs
        │   └── GetTransactionsHandler.cs
        ├── GetTransaction/
        │   ├── GetTransactionQuery.cs
        │   └── GetTransactionHandler.cs
        ├── CreateTransaction/
        │   ├── CreateTransactionCommand.cs
        │   └── CreateTransactionHandler.cs
        ├── UpdateTransaction/
        │   ├── UpdateTransactionCommand.cs
        │   └── UpdateTransactionHandler.cs
        └── DeleteTransaction/
            ├── DeleteTransactionCommand.cs
            └── DeleteTransactionHandler.cs
    ├── Products/
    │   ├── ProductResult.cs            ← shared DTO + internal ProductMapper (margin formula)
    │   ├── GetProducts/
    │   │   ├── GetProductsQuery.cs
    │   │   └── GetProductsHandler.cs
    │   ├── GetProduct/
    │   │   ├── GetProductQuery.cs
    │   │   └── GetProductHandler.cs
    │   ├── CreateProduct/
    │   │   ├── CreateProductCommand.cs
    │   │   └── CreateProductHandler.cs
    │   ├── UpdateProduct/
    │   │   ├── UpdateProductCommand.cs
    │   │   └── UpdateProductHandler.cs
    │   └── DeleteProduct/
    │       ├── DeleteProductCommand.cs
    │       └── DeleteProductHandler.cs
    ├── Employees/
    │   ├── GetEmployees/
    │   │   ├── GetEmployeesQuery.cs
    │   │   ├── GetEmployeesHandler.cs
    │   │   └── GetEmployeesResult.cs   ← includes computed TotalCost field
    │   └── CreateEmployee/
    │       ├── CreateEmployeeCommand.cs
    │       └── CreateEmployeeHandler.cs
    └── Imports/
        ├── ImportResult.cs             ← shared wire DTO (Errors deserialized from jsonb)
        ├── ImportResultMapper.cs       ← internal mapper with jsonb-tolerant Errors parsing
        ├── GetImports/
        │   ├── GetImportsQuery.cs
        │   └── GetImportsHandler.cs
        ├── GetImport/
        │   ├── GetImportQuery.cs
        │   └── GetImportHandler.cs
        └── CreateImport/
            ├── CreateImportCommand.cs
            └── CreateImportHandler.cs  ← 7-step upload-and-process orchestration
```

---

## NuGet Dependencies

| Package | Version | Why |
|---|---|---|
| `BCrypt.Net-Next` | 4.0.3 | Password hashing in `RegisterHandler`; verification in `LoginHandler` |
| `System.IdentityModel.Tokens.Jwt` | 8.2.1 | JWT creation and signing in `LoginHandler` |
| `Microsoft.Extensions.Options` | 9.0.4 | `IOptions<T>` used by the DI composition root in `CoreApi` to bind `JwtSettings` |

---

## Design Principles

**Handlers over MediatR** — handlers are plain C# classes registered directly in the DI container. No pipeline overhead, no interface ceremony; each use case is one file that's easy to find and easy to test.

**Commands as records** — input objects are immutable `record` types. They carry only what the caller provides; the handler decides everything else.

**Interface dependencies only** — handlers inject `IUserRepository`, never `UserRepository` or `AppDbContext`. This keeps the layer testable without a real database.

---

## `Auth/JwtSettings`

A plain POCO that mirrors the `JwtSettings` section of `appsettings.json`.

| Property | Type | Default | Description |
|---|---|---|---|
| `Secret` | `string` | — | HMAC-SHA256 signing key (min 32 ASCII chars / 256 bits) |
| `Issuer` | `string` | — | `iss` claim — identifies this API as the token issuer |
| `Audience` | `string` | — | `aud` claim — identifies the intended token consumer |
| `AccessTokenExpirationMinutes` | `int` | `15` | Lifetime of an access token |
| `RefreshTokenExpirationDays` | `int` | `30` | Maximum session length before the user must log in again with credentials |

`JwtSettings` lives in `Core.Application` so both the `LoginHandler` (which signs tokens) and `CoreApi` (which validates them) can share the exact same type — preventing issuer/audience drift between the two sides.

---

## `Auth/TokenFactory`

`internal static` helper that centralises all cryptographic token production. Both `LoginHandler` and `RefreshHandler` call it — any drift in claim shape, signing algorithm, or random-number source between the two flows would be a hard-to-spot security regression.

| Method | Returns | Notes |
|---|---|---|
| `CreateAccessToken(User, DateTime, JwtSettings)` | signed JWT string | Claims: `sub` (user id), `email`, `jti` (unique per token). Algorithm: HMAC-SHA256. |
| `CreateRefreshToken()` | base64 string | 64 bytes from `RandomNumberGenerator` (CSPRNG). `System.Random` is explicitly forbidden — it is predictable. |

---

## Use Cases

### `Auth/Register`

Registers a new platform user.

**Flow:**
1. Look up the email — throw `EmailAlreadyTakenException` if it already exists.
2. Hash the password with BCrypt.
3. Build a `User` entity with a new `Guid` id.
4. Persist via `IUserRepository.AddAsync`.

**Input:** `RegisterCommand(string Name, string Email, string Password)`

**Output:** none (void `Task`) — the controller returns `201 Created`.

**Exceptions thrown:**
- `EmailAlreadyTakenException` — email is already registered (→ `409 Conflict`).

---

### `Auth/Login`

Authenticates a user and issues a token pair.

**Flow:**
1. Look up user by email — throw `InvalidCredentialsException` if not found.
2. Verify the BCrypt hash — throw `InvalidCredentialsException` if it doesn't match.
3. Mint an access token via `TokenFactory.CreateAccessToken`.
4. Mint a refresh token via `TokenFactory.CreateRefreshToken`, persist the `RefreshToken` entity via `IRefreshTokenRepository.AddAsync` (persist before returning so the DB knows about the token before the client receives it).
5. Return a `LoginResult` with both tokens and the absolute expiry timestamp.

**Input:** `LoginCommand(string Email, string Password)`

**Output:** `LoginResult(string AccessToken, string RefreshToken, DateTime ExpiresAt)`

**Dependencies:** `IUserRepository`, `IRefreshTokenRepository`, `JwtSettings`.

**Security note:** both "email not found" and "wrong password" throw the same `InvalidCredentialsException` with the same generic message. This prevents user-enumeration attacks where an attacker could learn which emails exist by observing different error responses.

**Exceptions thrown:**
- `InvalidCredentialsException` — credentials did not match (→ `401 Unauthorized`).

---

### `Auth/GetMe`

Returns the public profile of the currently authenticated user.

**Flow:**
1. Look up the user by the id carried in `GetMeQuery` (extracted from the JWT `sub` claim by the controller).
2. Throw `UserNotFoundException` if the row is missing (token valid, user deleted).
3. Project to `GetMeResult`, explicitly omitting `PasswordHash`.

**Input:** `GetMeQuery(Guid UserId)`

**Output:** `GetMeResult(Guid Id, string? Name, string Email, DateTime CreatedAt)`

The handler trusts the `UserId` in the query because it can only be populated after JwtBearer middleware has validated the token. Token validity is a presentation-layer concern — the handler never re-validates it.

**Security note:** `GetMeResult` must never include `PasswordHash` (or any other secret field). Returning the raw `User` entity directly from a controller would serialize every property, including the BCrypt hash, into the response body.

**Exceptions thrown:**
- `UserNotFoundException` — user no longer exists (→ `404 Not Found`).

---

### `Auth/Refresh`

Exchanges a still-valid refresh token for a new access/refresh-token pair (token rotation).

**Flow:**
1. Look up the token — throw `InvalidRefreshTokenException` if not found, expired, or revoked.
2. Load the owning user by `UserId` — throw `InvalidRefreshTokenException` if the user no longer exists.
3. Mint a new access token and a new refresh token via `TokenFactory`.
4. **Revoke the old token first** — then persist the new one. Order is critical: if persistence fails after revocation the user must re-authenticate (safe). The opposite order would leave two valid tokens in circulation, defeating rotation.
5. Return a `RefreshResult` (same shape as `LoginResult`).

**Input:** `RefreshCommand(string Token)`

**Output:** `RefreshResult(string AccessToken, string RefreshToken, DateTime ExpiresAt)`

**Dependencies:** `IRefreshTokenRepository`, `IUserRepository`, `JwtSettings`.

**Exceptions thrown:**
- `InvalidRefreshTokenException` — token not found / expired / revoked, or owning user deleted (→ `401 Unauthorized`).

---

### `Auth/Logout`

Invalidates a single refresh token (single-device logout — other sessions are unaffected).

**Flow:**
1. Look up the token — throw `InvalidRefreshTokenException` if not found or already revoked.
2. Soft-revoke (set `IsRevoked = true`, keep the row).

Note: expiration is not checked here — revoking an already-expired token is harmless and idempotent. Only "not found" and "already revoked" are rejected, as both signal an illegitimate call.

**Input:** `LogoutCommand(string Token)`

**Output:** none (void `Task`).

**Dependencies:** `IRefreshTokenRepository`.

**Exceptions thrown:**
- `InvalidRefreshTokenException` — token unknown or already revoked (→ `401 Unauthorized`).

---

### `Auth/ForgotPassword`

Sends a password-reset email to a registered address.

**Flow:**
1. Look up the user by email. If not found, **return silently** — no exception, no error.
2. Mint a 64-byte CSPRNG token (base64-encoded).
3. **Persist the `PasswordResetToken` first**, then send the email. Order matters: if the send fails after persisting, the user has no email but the row exists — a retry (another forgot-password call) simply produces a fresh token. The reverse (send first, persist fails) would put a live link in the inbox that the server can never validate.
4. Delegate sending to `IEmailService.SendPasswordResetEmailAsync`.

**Security invariant:** the handler always returns success — even for unknown emails. The controller always returns `200 OK`. An attacker probing for valid email addresses must observe identical responses for registered and unregistered addresses.

**Token lifetime:** 1 hour (hard-coded in the handler).

**Input:** `ForgotPasswordCommand(string Email)`

**Output:** none (void `Task`).

**Dependencies:** `IUserRepository`, `IPasswordResetTokenRepository`, `IEmailService`.

---

### `Auth/ResetPassword`

Validates a reset token and applies the new password.

**Flow:**
1. Load the token — throw `InvalidResetTokenException` if null, expired, or already used.
2. Load the owning user — throw `InvalidResetTokenException` if the user no longer exists (defensive: cascade should handle this, but we guard anyway).
3. Hash the new password with BCrypt and call `IUserRepository.UpdateAsync`.
4. **Mark the token used after the password write** — if `MarkAsUsedAsync` fails after `UpdateAsync`, the user already has the new password and at worst the token row stays live until its 1-hour TTL. The reverse (mark first, then update password) would risk a "burnt token, no password change" state if the update fails.

**Security invariant:** all three failure modes (not found, expired, already used) throw the same `InvalidResetTokenException` with the same generic message — an attacker cannot distinguish "link was intercepted" from "link expired naturally" from "link already redeemed".

**Input:** `ResetPasswordCommand(string Token, string NewPassword)`

**Output:** none (void `Task`).

**Dependencies:** `IPasswordResetTokenRepository`, `IUserRepository`.

**Exceptions thrown:**
- `InvalidResetTokenException` — token not found / expired / used, or user deleted (→ `400 Bad Request`).

---

---

## User Profile Use Cases

These handlers manage the authenticated user's own account — name, email, and account deletion. `UserId` always comes from the JWT `sub` claim; the request body cannot dictate which account is being operated on.

### Shared DTO — `GetProfileResult`

```
GetProfileResult(Guid Id, string? Name, string Email, DateTime CreatedAt)
```

Returned by both `GetProfileHandler` and `UpdateProfileHandler` so clients only need to know one "user profile" shape. `PasswordHash` is intentionally absent.

---

### `Users/GetProfile`

Returns the authenticated user's profile. Functionally equivalent to `Auth/GetMe` — kept separate for symmetry with `UpdateProfile` and `DeleteAccount`.

**Input:** `GetProfileQuery(Guid UserId)`
**Output:** `GetProfileResult`

**Exceptions thrown:** `UserNotFoundException` → 404.

---

### `Users/UpdateProfile`

Updates the editable fields of the authenticated user's profile (`Name`, `Email`). `PasswordHash`, `Id`, and `CreatedAt` are not on the command surface.

**Flow:**
1. Load the user — `UserNotFoundException` if missing.
2. If the email is changing, check uniqueness: `GetByEmailAsync` and confirm the result (if any) belongs to a different user. Throws `EmailAlreadyTakenException` on conflict.
3. Apply `Name`, `Email`, `UpdatedAt` and persist.
4. Return the updated `GetProfileResult`.

**No-op optimisation:** if the supplied email equals the current email (case-insensitive), the uniqueness check is skipped — avoids a useless DB round-trip and a subtle edge case where `GetByEmailAsync` would return the caller themselves, falsely triggering the conflict check.

**Input:** `UpdateProfileCommand(Guid UserId, string? Name, string Email)`
**Output:** `GetProfileResult`

**Exceptions thrown:** `UserNotFoundException` → 404, `EmailAlreadyTakenException` → 409.

---

### `Users/DeleteAccount`

Permanently removes the authenticated user's account. All dependent rows are deleted by `ON DELETE CASCADE` constraints at the database level — the handler deletes only the `User` row.

**Why cascade via DB, not application code:**
- A new child table added to the schema without a corresponding `DELETE` statement in the handler would silently leave orphans; a DB cascade catches it automatically.
- A single `DELETE ON users` is atomic by construction; app-side cascades require an explicit transaction wrapper.

**Input:** `DeleteAccountCommand(Guid UserId)`
**Output:** none (void `Task`)

**Exceptions thrown:** `UserNotFoundException` → 404 (guard against stale/malformed JWT).

---

---

## MEI Use Cases

All MEI handlers inject only `IMeiRepository`. The `UserId` in every command/query comes from the JWT `sub` claim extracted by the controller — the request body has no `UserId` field and cannot influence ownership.

### Shared DTO — `MeiResult`

```
MeiResult(Guid Id, string Name, string? Cnpj, string? Cnae,
          decimal? AnnualLimit, string? Plan, DateTime CreatedAt, DateTime? UpdatedAt)
```

Used as the return type of every MEI use case that produces output. `UserId` is intentionally absent — it is implicit from the JWT. The `User` navigation property on `Mei` carries `PasswordHash`; a narrow DTO is the only safe wire shape.

---

### `Meis/GetMeis`

Lists every MEI owned by the caller. Multi-tenant isolation happens at the SQL level — the repository query is already scoped to `userId`, so no row from another tenant can slip through.

**Input:** `GetMeisQuery(Guid UserId)`  
**Output:** `IReadOnlyList<MeiResult>`

---

### `Meis/GetMei`

Fetches a single MEI with an explicit two-step ownership check:

1. Load by `MeiId` — throw `MeiNotFoundException` if null.
2. Compare `mei.UserId == query.UserId` — throw `UnauthorizedAccessException` if not.

Step order matters: existence is checked first so that a missing row produces `404`, not `403`.

**Input:** `GetMeiQuery(Guid UserId, Guid MeiId)`  
**Output:** `MeiResult`

**Exceptions thrown:**
- `MeiNotFoundException` → `404`
- `UnauthorizedAccessException` → `403`

---

### `Meis/CreateMei`

Creates a new MEI for the authenticated user.

1. If a `Cnpj` is supplied, load all existing MEIs for the user and check for a duplicate CNPJ. Throws `InvalidOperationException` on match (→ `409 Conflict`).
2. Build a `Mei` entity with a freshly generated `Guid` id (no DB round-trip needed for the id).
3. Persist via `AddAsync` and return the projection.

**Input:** `CreateMeiCommand(Guid UserId, string Name, string? Cnpj, string? Cnae, decimal? AnnualLimit, string? Plan)`  
**Output:** `MeiResult`

**Note:** `Cnpj` is nullable — MEIs may be created without one and have it filled in later via `UpdateMei`.

**Exceptions thrown:**
- `InvalidOperationException` — duplicate CNPJ for this user → `409 Conflict`

---

### `Meis/UpdateMei`

Updates the editable fields of an existing MEI after ownership verification (same two-step pattern as `GetMei`). `Cnpj`, `UserId`, and `CreatedAt` are intentionally not on the command surface — CNPJ identifies a real company in the Receita Federal and must not be silently changed.

**Editable fields:** `Name`, `Cnae`, `AnnualLimit`, `Plan`, `UpdatedAt` (set to `UtcNow`).

**Input:** `UpdateMeiCommand(Guid UserId, Guid MeiId, string Name, string? Cnae, decimal? AnnualLimit, string? Plan)`  
**Output:** `MeiResult`

**Exceptions thrown:**
- `MeiNotFoundException` → `404`
- `UnauthorizedAccessException` → `403`

---

### `Meis/DeleteMei`

Hard-deletes a MEI after existence and ownership checks. Cascade FKs in `AppDbContext` delete dependent rows (transactions, products, employees, documents, AI recommendations) automatically.

**Input:** `DeleteMeiCommand(Guid UserId, Guid MeiId)`  
**Output:** none (void `Task`)

**Exceptions thrown:**
- `MeiNotFoundException` → `404`
- `UnauthorizedAccessException` → `403`

---

---

## Transaction Use Cases

Transactions are nested under their parent MEI. Every handler performs a **two-level ownership check**:
1. Load the parent MEI — `MeiNotFoundException` if missing, `UnauthorizedAccessException` if owned by someone else (→ 403).
2. For single-resource operations, load the transaction — `TransactionNotFoundException` for both "doesn't exist" and "exists under a different MEI" (cross-MEI probe resistance).

All handlers inject both `IMeiRepository` and `ITransactionRepository`.

### Shared DTO — `TransactionResult`

```
TransactionResult(Guid Id, Guid MeiId, string Type, string? Category,
                  decimal Amount, DateOnly Date, string? Description,
                  DateTime CreatedAt, DateTime? UpdatedAt)
```

`MeiId` is included so clients building per-MEI dashboards can attribute rows without extra round-trips. `ImportId` is intentionally absent — it's infrastructure state, not product-facing data. The `Mei` navigation property chain (`Transaction → Mei → User → PasswordHash`) means returning the entity directly would leak credentials; a narrow DTO makes that impossible.

---

### `Transactions/GetTransactions`

Lists all transactions for a MEI, with optional chained filters.

**Filters (all optional):** `From DateOnly`, `To DateOnly`, `Type string`, `Category string` — any `null` means "skip this filter".

**Input:** `GetTransactionsQuery(Guid MeiId, Guid UserId, DateOnly? From, DateOnly? To, string? Type, string? Category)`
**Output:** `IReadOnlyList<TransactionResult>` (newest date first, then by `CreatedAt` descending)

**Exceptions thrown:** `MeiNotFoundException` → 404, `UnauthorizedAccessException` → 403.

---

### `Transactions/GetTransaction`

Fetches one transaction with the two-level security check.

**Input:** `GetTransactionQuery(Guid MeiId, Guid UserId, Guid TransactionId)`
**Output:** `TransactionResult`

**Exceptions thrown:** `MeiNotFoundException` → 404, `UnauthorizedAccessException` → 403, `TransactionNotFoundException` → 404 (covers both "doesn't exist" and "exists under a different MEI").

---

### `Transactions/CreateTransaction`

Creates a transaction inside the caller's MEI.

**Flow:**
1. MEI ownership check (before type validation — a probe against someone else's MEI gets 403, not a helpful type-error).
2. Type validation against `InvalidTransactionTypeException.ValidTypes`.
3. Build entity with freshly generated `Guid` id.
4. Persist and return projection.

**Input:** `CreateTransactionCommand(Guid MeiId, Guid UserId, string Type, string? Category, decimal Amount, DateOnly Date, string? Description)`
**Output:** `TransactionResult`

**Exceptions thrown:** `MeiNotFoundException` → 404, `UnauthorizedAccessException` → 403, `InvalidTransactionTypeException` → 400.

---

### `Transactions/UpdateTransaction`

Updates all editable fields of a transaction. `Id`, `MeiId`, `ImportId`, and `CreatedAt` are immutable.

**Flow:** MEI ownership → type validation → load transaction + cross-MEI guard → apply fields → persist.

**Input:** `UpdateTransactionCommand(Guid MeiId, Guid UserId, Guid TransactionId, string Type, string? Category, decimal Amount, DateOnly Date, string? Description)`
**Output:** `TransactionResult`

**Exceptions thrown:** `MeiNotFoundException` → 404, `UnauthorizedAccessException` → 403, `InvalidTransactionTypeException` → 400, `TransactionNotFoundException` → 404.

---

### `Transactions/DeleteTransaction`

Hard-deletes a transaction after both security checks.

**Input:** `DeleteTransactionCommand(Guid MeiId, Guid UserId, Guid TransactionId)`
**Output:** none (void `Task`)

**Exceptions thrown:** `MeiNotFoundException` → 404, `UnauthorizedAccessException` → 403, `TransactionNotFoundException` → 404.

---

---

## Product Use Cases

Products are nested under their parent MEI. Every handler injects `IMeiRepository` and `IProductRepository` and applies the same **two-level ownership check** as the Transaction handlers: verify MEI existence and ownership before any product operation, then for single-resource operations verify the product belongs to that MEI.

### `ProductResult` + `ProductMapper`

```
ProductResult(Guid Id, Guid MeiId, string Name, decimal? Cost, decimal? Price,
              decimal? DesiredMargin, string? Status, DateTime CreatedAt, DateTime? UpdatedAt,
              decimal Margin, bool IsMarginBelowDesired)
```

`Margin` and `IsMarginBelowDesired` are computed on every read by the `internal static ProductMapper.ToResult(Product)` helper — never stored, so they can never drift from `Cost`/`Price`.

**Margin formula (gross margin, in percent):**
```
margin = (Price - Cost) / Price * 100
isMarginBelowDesired = margin < DesiredMargin
```

**Defensive edge cases** (existing rows from Supabase may carry nulls):

| Condition | Behaviour |
|---|---|
| `Price` is `null` or `<= 0` | `Margin = 0`, `IsMarginBelowDesired = false` |
| `Cost` is `null` | Treated as `0` (margin = 100%) |
| `DesiredMargin` is `null` | `IsMarginBelowDesired = false` (no target to be below) |

`ProductMapper` is the **single source of truth** for the formula. All five handlers call it — a formula change requires editing exactly one place.

`Cost`, `Price`, `DesiredMargin`, and `Status` are nullable on the DTO to reflect the Postgres column types (scaffolded from Supabase). `Margin` and `IsMarginBelowDesired` are non-nullable because `ProductMapper` always provides a sensible default.

**Note on DTO placement:** `ProductResult` lives at `Products/ProductResult.cs` (not under `GetProducts/`) following the same convention as `MeiResult` and `TransactionResult`, so all handlers import from one place.

---

### `Products/GetProducts`

Lists all products in a MEI, with optional `status` filter.

**Input:** `GetProductsQuery(Guid MeiId, Guid UserId, string? Status)`
**Output:** `IReadOnlyList<ProductResult>` (newest first, then by name)

**Exceptions thrown:** `MeiNotFoundException` → 404, `UnauthorizedAccessException` → 403.

---

### `Products/GetProduct`

Fetches one product with the two-level ownership check.

**Input:** `GetProductQuery(Guid MeiId, Guid UserId, Guid ProductId)`
**Output:** `ProductResult`

**Exceptions thrown:** `MeiNotFoundException` → 404, `UnauthorizedAccessException` → 403, `ProductNotFoundException` → 404.

---

### `Products/CreateProduct`

Creates a product inside the caller's MEI. All fields are required at the command level even though the entity columns are nullable — forcing a complete row on creation avoids the "what's the margin of this product?" UX hole when fields are missing.

**Validation order (matters for security):**
1. MEI ownership (403 before any input-validation hint leaks to a probe).
2. `Status` must be `"active"` or `"inactive"` — `InvalidProductStatusException`.
3. `Price` must be `> 0` — `InvalidProductPriceException`.

**Input:** `CreateProductCommand(Guid MeiId, Guid UserId, string Name, decimal Cost, decimal Price, decimal DesiredMargin, string Status)`
**Output:** `ProductResult`

**Exceptions thrown:** `MeiNotFoundException` → 404, `UnauthorizedAccessException` → 403, `InvalidProductStatusException` → 400, `InvalidProductPriceException` → 400.

---

### `Products/UpdateProduct`

Updates all editable fields of a product. `Id`, `MeiId`, and `CreatedAt` are immutable. Same validation order as `CreateProduct` (ownership → status → price → load product).

**Input:** `UpdateProductCommand(Guid MeiId, Guid UserId, Guid ProductId, string Name, decimal Cost, decimal Price, decimal DesiredMargin, string Status)`
**Output:** `ProductResult`

**Exceptions thrown:** `MeiNotFoundException` → 404, `UnauthorizedAccessException` → 403, `InvalidProductStatusException` → 400, `InvalidProductPriceException` → 400, `ProductNotFoundException` → 404.

---

### `Products/DeleteProduct`

Hard-deletes a product after existence and ownership checks.

**Input:** `DeleteProductCommand(Guid MeiId, Guid UserId, Guid ProductId)`
**Output:** none (void `Task`)

**Exceptions thrown:** `MeiNotFoundException` → 404, `UnauthorizedAccessException` → 403, `ProductNotFoundException` → 404.

---

---

## Employee Use Cases

Employees are nested under their parent MEI. The initial slice ships only List and Create — Update/Delete will be added when those use cases land. Every handler performs a **two-level ownership check** (MEI existence → MEI ownership) before touching employee rows.

### `GetEmployeesResult`

```
GetEmployeesResult(Guid Id, Guid MeiId, string Name, string? ContractType,
                   decimal? Salary, decimal? Charges, DateTime CreatedAt, DateTime? UpdatedAt,
                   decimal TotalCost)
```

`TotalCost = Salary + Charges` — the full monthly cost of keeping the employee on payroll (base salary + all employer-side charges such as INSS patronal, FGTS, etc.). Computed in the handler; never stored, so it cannot drift from its inputs. Null `Salary`/`Charges` are treated as `0` so `TotalCost` is always non-nullable.

`ContractType`, `Salary`, and `Charges` are nullable on the DTO to honestly reflect the Postgres column types (existing rows scaffolded from Supabase may carry nulls).

---

### `Employees/GetEmployees`

Lists all employees in a MEI.

**Input:** `GetEmployeesQuery(Guid MeiId, Guid UserId)`
**Output:** `IReadOnlyList<GetEmployeesResult>` (newest first, then alphabetical by name)

**Exceptions thrown:** `MeiNotFoundException` → 404, `UnauthorizedAccessException` → 403.

---

### `Employees/CreateEmployee`

Creates a new employee in the caller's MEI. `ContractType`, `Salary`, and `Charges` are required at the command level (even though the entity columns allow null) — forcing a complete row on creation keeps `TotalCost` calculations truthful from day one.

**Validation order (matters for security):**
1. MEI ownership (403 before any input-validation hint leaks to a probe).
2. `ContractType` must be `"clt"`, `"pj"`, or `"intern"` — `InvalidContractTypeException`.
3. `Salary` must be `> 0` — `InvalidSalaryException`.

**Input:** `CreateEmployeeCommand(Guid MeiId, Guid UserId, string Name, string ContractType, decimal Salary, decimal Charges)`
**Output:** none (void `Task`) — controller returns `201 Created` with no body.

**Exceptions thrown:** `MeiNotFoundException` → 404, `UnauthorizedAccessException` → 403, `InvalidContractTypeException` → 400, `InvalidSalaryException` → 400.

---

---

## Import Use Cases

Imports are nested under their parent MEI. The initial slice ships List, Get, and Create (upload + process). No Delete — imports are append-only for audit purposes; users can see every job that ran and its errors.

### `ImportResult` + `ImportResultMapper`

```
ImportResult(Guid Id, Guid MeiId, string FileUri, string Status,
             int? TotalRows, int? ProcessedRows, IReadOnlyList<string>? Errors,
             DateTime CreatedAt, DateTime? UpdatedAt)
```

The `Errors` column is `jsonb` in PostgreSQL (stored as a JSON-encoded array of strings). `ImportResultMapper.ToResult` deserialises it back to `IReadOnlyList<string>?` for the wire. Parse failures are downgraded to a single-element list containing the raw text — the mapper never throws, so a hand-written or legacy row can't break a read.

---

### `Imports/GetImports`

Lists all import rows in a MEI.

**Input:** `GetImportsQuery(Guid MeiId, Guid UserId)`
**Output:** `IReadOnlyList<ImportResult>` (newest first)

**Exceptions thrown:** `MeiNotFoundException` → 404, `UnauthorizedAccessException` → 403.

---

### `Imports/GetImport`

Fetches one import with the two-level ownership check plus cross-MEI guard.

**Input:** `GetImportQuery(Guid MeiId, Guid UserId, Guid ImportId)`
**Output:** `ImportResult`

**Exceptions thrown:** `MeiNotFoundException` → 404, `UnauthorizedAccessException` → 403, `ImportNotFoundException` → 404 (covers "doesn't exist" and "exists under a different MEI").

---

### `Imports/CreateImport`

Orchestrates the full upload-and-classify flow synchronously. Returns the final `ImportResult` to the caller regardless of whether FastAPI succeeded or failed.

**7-step flow:**

1. **MEI ownership** — reject before any I/O (403 before burning an LLM call).
2. **Upload to Supabase Storage** — key is `{meiId}/{guid}-{fileName}` (collision-proof, no cross-tenant URL guessing).
3. **Persist Import row as `"processing"`** — committed to DB before the FastAPI call so the row survives any downstream failure.
4. **Call FastAPI** — transport errors are caught; the row transitions to `"error"` and the exception message is stored in `Errors`. The import is never left stuck in `"processing"`.
5. **Persist classified rows** — transactions (with `ImportId` FK), products, and employees from the FastAPI response are written via their existing repositories.
6. **Update Import row** — final status (`"completed"` / `"partial"` / `"error"`), `TotalRows`, `ProcessedRows`, and `Errors` (JSON-serialised array) are persisted.
7. **Return** — `ImportResultMapper.ToResult` produces the final wire DTO.

**Status mapping** (FastAPI → Import.Status): `"success"` → `"completed"`, `"partial"` → `"partial"`, `"error"` / unknown → `"error"`.

**Input:** `CreateImportCommand(Guid MeiId, Guid UserId, string FileName, Stream FileStream, string ContentType)`
**Output:** `ImportResult`

**Dependencies:** `IMeiRepository`, `IImportRepository`, `IStorageService`, `IFastApiService`, `ITransactionRepository`, `IProductRepository`, `IEmployeeRepository`.

**Exceptions thrown:** `MeiNotFoundException` → 404, `UnauthorizedAccessException` → 403. Transport failures from FastAPI/Storage surface as `ImportResult.Status = "error"`, not as HTTP errors.

---

## `Interfaces/`

### `IEmailService`

Abstraction for transactional email. `Core.Application` handlers depend on this interface; `Core.Infrastructure` supplies the concrete `ResendEmailService` implementation.

Methods are named after their *intent*, not the transport, so implementations own the HTML/text template and handlers stay free of markup.

| Method | Description |
|---|---|
| `SendPasswordResetEmailAsync(string toEmail, string resetLink, ...)` | Sends the password-reset email with the one-time link |

Why an interface rather than a direct Resend dependency: handlers remain unit-testable (Moq can replace the email service), the provider can be swapped (Mailgun, SES, SMTP) by writing a new implementation, and `Core.Application` stays free of third-party SDK types.

### `IFastApiService`

Abstraction for the FastAPI LLM classification service.

| Method | Description |
|---|---|
| `ProcessImportAsync(string importId, string meiId, string fileUrl, ...)` | Sends a job to FastAPI and returns the parsed `ImportResponse` |

Parameters use `string` for ids because the call crosses a process boundary; Guid parsing is the caller's responsibility. Throws on transport failure or non-2xx — `CreateImportHandler` catches and records the error in the Import row.

### `IStorageService`

Abstraction for object storage (upload-and-get-public-URL).

| Method | Description |
|---|---|
| `UploadFileAsync(string bucketName, string fileName, Stream fileStream, string contentType, ...)` | Uploads one file and returns a URL any HTTP client can download |

Intentionally narrow — one method, no list/delete/signed-URL helpers. The surface grows when a use case actually needs it.

### `DTOs/ImportResponse`

Strongly-typed mirror of the FastAPI `/api/import/process` JSON response. All field names carry `[JsonPropertyName("snake_case")]` attributes so the rest of the C# codebase stays in PascalCase regardless of FastAPI naming conventions.

| Sub-DTO | Purpose |
|---|---|
| `ImportResponse` | Top-level payload: ids, counts, status, errors, child rows |
| `ImportTransactionDto` | One classified transaction row; `Date` is kept as `string` (parsed to `DateOnly` in the handler) |
| `ImportProductDto` | One classified product row; `Cost`/`Price`/`DesiredMargin` are nullable |
| `ImportEmployeeDto` | One classified employee row; `ContractType`/`Salary`/`Charges` are nullable |

---

## Adding a New Use Case

1. Create a folder under `UseCases/<Feature>/<Action>/`.
2. Add a `<Action>Command.cs` record with the input fields.
3. Add a `<Action>Handler.cs` class. Inject only interfaces from `Core.Domain`.
4. If the use case returns data, add a `<Action>Result.cs` record.
5. Register the handler in `CoreApi/Program.cs` with `builder.Services.AddScoped<YourHandler>()`.
6. Add a controller action in `CoreApi/Controllers/` that maps HTTP ↔ command/result.
