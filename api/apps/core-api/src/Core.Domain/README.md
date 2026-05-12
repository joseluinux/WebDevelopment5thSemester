# Core.Domain

The innermost layer of the Clean Architecture. Contains all business rules, entities, and contracts. Has **zero dependencies** on any other project or external framework — nothing references it except by intent, and it references nothing.

```
Core.Domain/
├── Entities/             ← domain entities (data model)
│   ├── User.cs
│   ├── Mei.cs
│   ├── Employee.cs
│   ├── Product.cs
│   ├── Transaction.cs
│   ├── Import.cs
│   ├── Document.cs
│   ├── AiRecommendation.cs
│   ├── RefreshToken.cs
│   └── PasswordResetToken.cs
├── Interfaces/           ← repository contracts (implemented by Core.Infrastructure)
│   ├── IUserRepository.cs
│   ├── IRefreshTokenRepository.cs
│   ├── IPasswordResetTokenRepository.cs
│   ├── IMeiRepository.cs
│   ├── IEmployeeRepository.cs
│   ├── IImportRepository.cs
│   ├── ITransactionRepository.cs
│   └── IProductRepository.cs
└── Exceptions/           ← domain exceptions (thrown by application handlers)
    ├── EmailAlreadyTakenException.cs
    ├── InvalidCredentialsException.cs
    ├── InvalidRefreshTokenException.cs
    ├── InvalidResetTokenException.cs
    ├── InvalidTransactionTypeException.cs
    ├── InvalidProductStatusException.cs
    ├── InvalidProductPriceException.cs
    ├── InvalidContractTypeException.cs
    ├── InvalidSalaryException.cs
    ├── MeiNotFoundException.cs
    ├── EmployeeNotFoundException.cs
    ├── ImportNotFoundException.cs
    ├── ProductNotFoundException.cs
    ├── TransactionNotFoundException.cs
    └── UserNotFoundException.cs
```

---

## Domain Context

This is the domain layer for **LumeMEI** — a management platform for MEI businesses.

> **MEI** (Microempreendedor Individual) is a Brazilian simplified business registration type with a capped annual revenue limit and a reduced tax regime.

Each `User` on the platform can register and manage one or more `Mei` businesses. All other entities belong to a `Mei`.

---

## Entity Map

```
User ──< Mei ──< Employee
              ├─< Product
              ├─< Transaction >──? Import
              ├─< Import ──< Transaction
              ├─< Document
              └─< AiRecommendation
```

---

## Entities

### `User`
Platform account. Owns one or more `Mei` businesses.

| Property | Type | Description |
|---|---|---|
| `Id` | `Guid` | Primary key (`uuid_generate_v4()`) |
| `Email` | `string` | Unique login identifier |
| `PasswordHash` | `string` | BCrypt-hashed password |
| `Name` | `string?` | Display name |
| `CreatedAt` | `DateTime` | Record creation timestamp |
| `UpdatedAt` | `DateTime?` | Last update timestamp |

---

### `Mei`
A registered MEI business belonging to a `User`.

| Property | Type | Description |
|---|---|---|
| `Id` | `Guid` | Primary key |
| `UserId` | `Guid` | FK → `User` |
| `Name` | `string` | Business name |
| `Cnpj` | `string?` | Unique Brazilian business registration number |
| `Cnae` | `string?` | Activity classification code |
| `AnnualLimit` | `decimal?` | Annual revenue ceiling for the MEI regime |
| `Plan` | `string?` | Subscription plan on the platform |
| `CreatedAt` | `DateTime` | Record creation timestamp |
| `UpdatedAt` | `DateTime?` | Last update timestamp |

---

### `Employee`
An employee registered under a `Mei`.

| Property | Type | Description |
|---|---|---|
| `Id` | `Guid` | Primary key |
| `MeiId` | `Guid` | FK → `Mei` |
| `Name` | `string` | Employee full name |
| `ContractType` | `string?` | Employment contract type (e.g. CLT, PJ) |
| `Salary` | `decimal?` | Base salary |
| `Charges` | `decimal?` | Employer social charges |
| `CreatedAt` | `DateTime` | Record creation timestamp |
| `UpdatedAt` | `DateTime?` | Last update timestamp |

---

### `Product`
A product or service offered by a `Mei`.

| Property | Type | Description |
|---|---|---|
| `Id` | `Guid` | Primary key |
| `MeiId` | `Guid` | FK → `Mei` |
| `Name` | `string` | Product/service name |
| `Cost` | `decimal?` | Production or acquisition cost |
| `Price` | `decimal?` | Selling price |
| `DesiredMargin` | `decimal?` | Target profit margin (%) |
| `Status` | `string?` | Availability status (default: `active`) |
| `CreatedAt` | `DateTime` | Record creation timestamp |
| `UpdatedAt` | `DateTime?` | Last update timestamp |

---

### `Transaction`
A financial movement (income or expense) for a `Mei`. Can originate from a bulk `Import`.

| Property | Type | Description |
|---|---|---|
| `Id` | `Guid` | Primary key |
| `MeiId` | `Guid` | FK → `Mei` |
| `ImportId` | `Guid?` | FK → `Import` (set null on import deletion) |
| `Type` | `string` | Movement direction (`income` / `expense`) |
| `Category` | `string?` | Business category label |
| `Amount` | `decimal` | Transaction value |
| `Description` | `string?` | Free-text note |
| `Date` | `DateOnly` | Date of the transaction |
| `CreatedAt` | `DateTime` | Record creation timestamp |
| `UpdatedAt` | `DateTime?` | Last update timestamp |

---

### `Import`
A bulk file import job that creates multiple `Transaction` records from a file.

| Property | Type | Description |
|---|---|---|
| `Id` | `Guid` | Primary key |
| `MeiId` | `Guid` | FK → `Mei` |
| `FileUri` | `string` | Storage URI of the uploaded file |
| `Status` | `string` | Processing state (default: `pending`) |
| `TotalRows` | `int?` | Total rows detected in the file |
| `ProcessedRows` | `int?` | Rows successfully processed (default: `0`) |
| `Errors` | `string?` | JSONB array of row-level errors |
| `CreatedAt` | `DateTime` | Record creation timestamp |
| `UpdatedAt` | `DateTime?` | Last update timestamp |

---

### `Document`
A document or file attached to a `Mei` (e.g. contracts, invoices, certificates).

| Property | Type | Description |
|---|---|---|
| `Id` | `Guid` | Primary key |
| `MeiId` | `Guid` | FK → `Mei` |
| `Title` | `string` | Document title |
| `Content` | `string` | Text content or extracted body |
| `FileUri` | `string?` | Storage URI of the associated file |
| `CreatedAt` | `DateTime` | Record creation timestamp |

---

### `RefreshToken`
A persisted server-side record that represents one active or revoked session. The client holds only the opaque token string; all validity metadata lives here.

| Property | Type | Description |
|---|---|---|
| `Id` | `Guid` | Primary key (`uuid_generate_v4()`) |
| `UserId` | `Guid` | FK → `User` (cascade delete) |
| `Token` | `string` | Opaque CSPRNG string the client presents (unique index) |
| `ExpiresAt` | `DateTime` | Absolute UTC expiry — checked on every refresh |
| `IsRevoked` | `bool` | Soft-delete flag; rows are never physically deleted |
| `CreatedAt` | `DateTime` | Record creation timestamp |

Rows are never deleted. Keeping them enables audit trails ("when did this session end?") and detection of revoked-token reuse, which is a strong signal of token theft.

---

### `PasswordResetToken`
A persisted server-side token authorising a single password reset. The user receives the opaque token string by email; all validity metadata lives in this row.

| Property | Type | Description |
|---|---|---|
| `Id` | `Guid` | Primary key (`uuid_generate_v4()`) |
| `UserId` | `Guid` | FK → `User` (cascade delete) |
| `Token` | `string` | Opaque CSPRNG string sent to the user by email (unique index, max 512 chars) |
| `ExpiresAt` | `DateTime` | Absolute UTC expiry — fixed at 1 hour from issue time |
| `IsUsed` | `bool` | Single-use flag; set to `true` on first successful redemption |
| `CreatedAt` | `DateTime` | Record creation timestamp |

Rows are never physically deleted. Keeping them enables audit trails and detection of replay attempts (reuse of an expired or already-redeemed token is a strong signal that a reset link was intercepted).

---

### `AiRecommendation`
An AI-generated insight or recommendation produced for a `Mei`.

| Property | Type | Description |
|---|---|---|
| `Id` | `Guid` | Primary key |
| `MeiId` | `Guid` | FK → `Mei` |
| `Type` | `string` | Recommendation category (e.g. `financial`, `tax`) |
| `Content` | `string` | Human-readable recommendation text |
| `Metadata` | `string?` | JSONB payload with supporting data |
| `CreatedAt` | `DateTime` | Record creation timestamp |

---

## `Interfaces/`

Repository contracts that `Core.Infrastructure` must implement, following the Dependency Inversion Principle. `Core.Application` depends only on these interfaces — never on the concrete EF Core repositories.

### `IUserRepository`

```csharp
Task<User?> GetByEmailAsync(string email, CancellationToken cancellationToken = default);
Task<User?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default);
Task AddAsync(User user, CancellationToken cancellationToken = default);
Task UpdateAsync(User user, CancellationToken cancellationToken = default);
Task DeleteAsync(Guid id, CancellationToken cancellationToken = default);
```

The nullable return type on both `Get*` methods explicitly communicates that "not found" is a valid, expected outcome — not an exceptional case that should throw. `GetByIdAsync` is used by authenticated endpoints that already know which user to load (via the JWT `sub` claim). `DeleteAsync` removes the row and relies on `ON DELETE CASCADE` constraints to remove all dependent rows (refresh tokens, MEIs, and every grandchild); the repository never manually cascades.

### `IRefreshTokenRepository`

```csharp
Task AddAsync(RefreshToken refreshToken, CancellationToken cancellationToken = default);
Task<RefreshToken?> GetByTokenAsync(string token, CancellationToken cancellationToken = default);
Task RevokeAsync(RefreshToken refreshToken, CancellationToken cancellationToken = default);
```

Intentionally minimal — no `GetByUserAsync`, no `DeleteAsync`. The surface area is kept small until a real use case demands more. `RevokeAsync` performs a soft delete (sets `IsRevoked = true`, keeps the row).

### `IPasswordResetTokenRepository`

```csharp
Task AddAsync(PasswordResetToken token, CancellationToken cancellationToken = default);
Task<PasswordResetToken?> GetByTokenAsync(string token, CancellationToken cancellationToken = default);
Task MarkAsUsedAsync(Guid id, CancellationToken cancellationToken = default);
```

Narrow surface by design — forgot-password creates a row, reset-password reads it and marks it used. `MarkAsUsedAsync` performs a soft consume (sets `IsUsed = true`, keeps the row for audit and replay detection). `GetByTokenAsync` returns `null` when not found; the handler treats "not found", "expired", and "already used" as the same `InvalidResetTokenException` to prevent enumeration.

### `IEmployeeRepository`

```csharp
Task<IReadOnlyList<Employee>> GetAllByMeiIdAsync(Guid meiId, CancellationToken cancellationToken = default);
Task<Employee?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default);
Task AddAsync(Employee employee, CancellationToken cancellationToken = default);
```

Smaller surface than the other CRUD repositories — only List, GetById, and Add are shipped; Update/Delete will be added when their use cases land. `GetByIdAsync` is not used by this slice's two handlers (List + Create) but is kept on the interface so future per-employee endpoints can build on it without expanding the contract.

### `IImportRepository`

```csharp
Task<IReadOnlyList<Import>> GetAllByMeiIdAsync(Guid meiId, CancellationToken cancellationToken = default);
Task<Import?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default);
Task AddAsync(Import import, CancellationToken cancellationToken = default);
Task UpdateAsync(Import import, CancellationToken cancellationToken = default);
```

`UpdateAsync` is required because `CreateImportHandler` mutates the same row twice in one request: once to mark it `"processing"` (persisted before the FastAPI call) and again to record the final status/counters/errors. The `GetByIdAsync` return is nullable — the handler maps "not found" and "exists under a different MEI" to the same `ImportNotFoundException` (cross-MEI probe resistance).

### `IMeiRepository`

```csharp
Task<IReadOnlyList<Mei>> GetAllByUserIdAsync(Guid userId, CancellationToken cancellationToken = default);
Task<Mei?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default);
Task AddAsync(Mei mei, CancellationToken cancellationToken = default);
Task UpdateAsync(Mei mei, CancellationToken cancellationToken = default);
Task DeleteAsync(Guid id, CancellationToken cancellationToken = default);
```

This interface intentionally does **not** enforce ownership. Filtering "user X owns MEI Y" is a use-case concern that belongs in the application layer, where the right exception (`MeiNotFoundException` vs `UnauthorizedAccessException`) can be chosen deliberately. A repository that silently hid rows by user id would make the ownership check invisible and easy to accidentally skip. `DeleteAsync` is a hard delete — no soft-delete flag on `Mei`.

### `ITransactionRepository`

```csharp
Task<IReadOnlyList<Transaction>> GetAllByMeiIdAsync(
    Guid meiId, DateOnly? from, DateOnly? to, string? type, string? category,
    CancellationToken cancellationToken = default);
Task<Transaction?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default);
Task AddAsync(Transaction transaction, CancellationToken cancellationToken = default);
Task UpdateAsync(Transaction transaction, CancellationToken cancellationToken = default);
Task DeleteAsync(Guid id, CancellationToken cancellationToken = default);
```

`GetAllByMeiIdAsync` accepts optional filters (date range, type, category); any `null` parameter means "do not filter on this dimension". Ownership enforcement is not in the repository — the application layer verifies the caller owns the parent MEI before querying transactions.

### `IProductRepository`

```csharp
Task<IReadOnlyList<Product>> GetAllByMeiIdAsync(Guid meiId, string? status, CancellationToken cancellationToken = default);
Task<Product?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default);
Task AddAsync(Product product, CancellationToken cancellationToken = default);
Task UpdateAsync(Product product, CancellationToken cancellationToken = default);
Task DeleteAsync(Guid id, CancellationToken cancellationToken = default);
```

`GetAllByMeiIdAsync` accepts an optional `status` filter (`"active"` / `"inactive"`); `null` or empty means no filter. Like `ITransactionRepository`, ownership enforcement is the application layer's responsibility.

---

## `Exceptions/`

Domain exceptions represent violations of business rules. They are thrown by `Core.Application` handlers and caught by `CoreApi` controllers, which map them to the appropriate HTTP status codes.

### `EmailAlreadyTakenException`
Thrown during registration when the submitted email is already in use. Controllers map this to `409 Conflict`.

### `InvalidCredentialsException`
Thrown during login when either the email is not found or the password does not match. A single exception type is used for both failure modes to prevent user-enumeration attacks — an attacker cannot tell from the error which field was wrong.

### `InvalidRefreshTokenException`
Thrown by `RefreshHandler` and `LogoutHandler` when a refresh-token operation is rejected. A single exception type covers three underlying causes: token not found, token expired, and token revoked. The reason mirrors `InvalidCredentialsException`: an attacker must not be able to tell from the error response whether a token ever existed, whether it expired naturally, or whether it was explicitly revoked. Controllers map this to `401 Unauthorized`.

### `InvalidProductStatusException`
Thrown when a Create or Update product command carries a `Status` value other than `"active"` or `"inactive"`. Exposes the canonical list:

```csharp
public static readonly IReadOnlyList<string> ValidStatuses = new[] { "active", "inactive" };
```

Controllers map this to `400 Bad Request`.

### `InvalidProductPriceException`
Thrown when `Price <= 0` on a Create or Update command. Zero is rejected because the margin formula `(Price - Cost) / Price * 100` divides by `Price` — a zero or negative price would produce a division-by-zero or nonsensical result. Controllers map this to `400 Bad Request`.

### `ProductNotFoundException`
Thrown when a product lookup by id returns no row **or** when the row exists but belongs to a different MEI than the one in the URL (cross-MEI probe resistance — same dual-cause pattern as `TransactionNotFoundException`). Controllers map this to `404 Not Found`.

### `InvalidTransactionTypeException`
Thrown when a Create or Update command carries a `Type` value other than `"income"` or `"expense"`. The exception class itself exposes the canonical list as a static field:

```csharp
public static readonly IReadOnlyList<string> ValidTypes = new[] { "income", "expense" };
```

Handlers import `ValidTypes` from here — not from a local constant — so adding a third type in the future requires only one change. Controllers map this to `400 Bad Request`.

### `TransactionNotFoundException`
Thrown when a transaction lookup by id finds no row **or** when the row exists but lives under a different MEI than the one in the URL. Both cases surface the same exception deliberately — an attacker probing for transaction ids across MEIs cannot tell "doesn't exist" from "exists under another MEI you don't own". Controllers map this to `404 Not Found`.

(The parent-MEI ownership violation — correct MEI in the URL but owned by a different user — surfaces as `UnauthorizedAccessException` → `403`, consistent with the MEI ownership pattern.)

### `MeiNotFoundException`
Thrown when a MEI lookup by id returns no row. Controllers map this to `404 Not Found`.

**Important:** this exception is thrown only when a row genuinely does not exist. When the row exists but belongs to a different user, handlers throw `UnauthorizedAccessException` instead (→ `403 Forbidden`). The distinction is intentional: `403` is a clearer signal during development and operations, and GUID ids are not enumerable so the small information disclosure (confirming some row exists) is an accepted trade-off.

### `UserNotFoundException`
Thrown from authenticated use cases (e.g. `GetMeHandler`, `GetProfileHandler`, `UpdateProfileHandler`, `DeleteAccountHandler`) when a valid JWT references a user that no longer exists (account deleted after the token was issued). This is intentionally distinct from `InvalidCredentialsException`: in an already-authenticated context the caller owns the token, so revealing "this id is gone" leaks nothing an attacker does not already know. Controllers map this to `404 Not Found`.

### `InvalidResetTokenException`
Thrown by `ResetPasswordHandler` when the supplied reset token is unknown, expired, or already used. A single exception covers all three failure modes — the same user-enumeration / replay-resistance defence used by `InvalidCredentialsException` and `InvalidRefreshTokenException`. An attacker holding an intercepted, expired, or replayed link cannot distinguish any of the three outcomes. Controllers map this to `400 Bad Request`.

### `EmployeeNotFoundException`
Thrown when an employee lookup by id finds no row **or** when the row exists but does not belong to the MEI in the URL (cross-MEI probe resistance, same dual-cause pattern as `ProductNotFoundException` and `TransactionNotFoundException`). Not used by the initial List + Create slice, but reserved for future per-employee endpoints. Controllers map this to `404 Not Found`.

### `InvalidContractTypeException`
Thrown when a Create employee command carries a `ContractType` outside the allowed set. Exposes the canonical list:

```csharp
public static readonly IReadOnlyList<string> ValidContractTypes = new[] { "clt", "pj", "intern" };
```

`"clt"` is the Brazilian formal employment contract; `"pj"` is a service contractor arrangement; `"intern"` is governed by Lei do Estágio. Controllers map this to `400 Bad Request`.

### `InvalidSalaryException`
Thrown when a Create employee command carries a `Salary <= 0`. Zero or negative pay makes no business sense for any contract type and would produce misleading TotalCost calculations downstream. Controllers map this to `400 Bad Request`.

### `ImportNotFoundException`
Thrown when an import lookup by id finds no row **or** when the row exists but does not belong to the MEI in the URL (cross-MEI probe resistance, same dual-cause pattern as `ProductNotFoundException` and `TransactionNotFoundException`). Controllers map this to `404 Not Found`.

---

## Known Issues

- All entity files currently carry `namespace Core.Infrastructure` instead of `namespace Core.Domain`. This is a side effect of EF Core scaffolding and should be corrected so the namespace matches the project and folder.
