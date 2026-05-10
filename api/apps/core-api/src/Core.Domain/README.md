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
│   └── RefreshToken.cs
├── Interfaces/           ← repository contracts (implemented by Core.Infrastructure)
│   ├── IUserRepository.cs
│   ├── IRefreshTokenRepository.cs
│   ├── IMeiRepository.cs
│   └── ITransactionRepository.cs
└── Exceptions/           ← domain exceptions (thrown by application handlers)
    ├── EmailAlreadyTakenException.cs
    ├── InvalidCredentialsException.cs
    ├── InvalidRefreshTokenException.cs
    ├── InvalidTransactionTypeException.cs
    ├── MeiNotFoundException.cs
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
```

The nullable return type on both `Get*` methods explicitly communicates that "not found" is a valid, expected outcome — not an exceptional case that should throw. `GetByIdAsync` is used by authenticated endpoints that already know which user to load (via the JWT `sub` claim).

### `IRefreshTokenRepository`

```csharp
Task AddAsync(RefreshToken refreshToken, CancellationToken cancellationToken = default);
Task<RefreshToken?> GetByTokenAsync(string token, CancellationToken cancellationToken = default);
Task RevokeAsync(RefreshToken refreshToken, CancellationToken cancellationToken = default);
```

Intentionally minimal — no `GetByUserAsync`, no `DeleteAsync`. The surface area is kept small until a real use case demands more. `RevokeAsync` performs a soft delete (sets `IsRevoked = true`, keeps the row).

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

---

## `Exceptions/`

Domain exceptions represent violations of business rules. They are thrown by `Core.Application` handlers and caught by `CoreApi` controllers, which map them to the appropriate HTTP status codes.

### `EmailAlreadyTakenException`
Thrown during registration when the submitted email is already in use. Controllers map this to `409 Conflict`.

### `InvalidCredentialsException`
Thrown during login when either the email is not found or the password does not match. A single exception type is used for both failure modes to prevent user-enumeration attacks — an attacker cannot tell from the error which field was wrong.

### `InvalidRefreshTokenException`
Thrown by `RefreshHandler` and `LogoutHandler` when a refresh-token operation is rejected. A single exception type covers three underlying causes: token not found, token expired, and token revoked. The reason mirrors `InvalidCredentialsException`: an attacker must not be able to tell from the error response whether a token ever existed, whether it expired naturally, or whether it was explicitly revoked. Controllers map this to `401 Unauthorized`.

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
Thrown from authenticated use cases (e.g. `GetMeHandler`) when a valid JWT references a user that no longer exists (account deleted after the token was issued). This is intentionally distinct from `InvalidCredentialsException`: in an already-authenticated context the caller owns the token, so revealing "this id is gone" leaks nothing an attacker does not already know. Controllers map this to `404 Not Found`.

---

## Known Issues

- All entity files currently carry `namespace Core.Infrastructure` instead of `namespace Core.Domain`. This is a side effect of EF Core scaffolding and should be corrected so the namespace matches the project and folder.
