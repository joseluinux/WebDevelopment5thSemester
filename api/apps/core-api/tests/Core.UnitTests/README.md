# Core.UnitTests

Unit tests for business logic in `Core.Application`. Tests run in-process with no database, no HTTP pipeline, and no file system — every external collaborator is replaced by a Moq double.

```
Core.UnitTests/
├── Auth/
│   ├── RegisterHandlerTests.cs   ← 2 tests for the Register use case
│   ├── LoginHandlerTests.cs      ← 3 tests for the Login use case
│   ├── GetMeHandlerTests.cs      ← 2 tests for the GetMe use case
│   └── RefreshHandlerTests.cs    ← 3 tests for the Refresh use case
├── Meis/
│   └── MeiHandlerTests.cs        ← 3 tests covering the MEI CRUD security surface
└── Transactions/
    └── CreateTransactionHandlerTests.cs  ← 3 tests for CreateTransaction
```

---

## Stack

| Package | Purpose |
|---|---|
| xUnit 2.9 | Test runner and assertions |
| Moq 4.20 | Mock `IUserRepository` — removes the database dependency |
| coverlet | Code coverage collection |

---

## Test Cases

### `RegisterHandlerTests`

| Test | Scenario | Expected |
|---|---|---|
| `HandleAsync_ValidData_CallsAddAsyncOnce` | New email, valid input | `IUserRepository.AddAsync` called exactly once |
| `HandleAsync_DuplicateEmail_ThrowsEmailAlreadyTakenException` | Email already in the repository | Throws `EmailAlreadyTakenException` before any write |

### `LoginHandlerTests`

`JwtSettings` is constructed inline as a plain POCO — no config file needed.

| Test | Scenario | Expected |
|---|---|---|
| `HandleAsync_ValidCredentials_ReturnsLoginResultWithAccessToken` | Matching email + BCrypt-verified password | Returns `LoginResult` with a non-empty `AccessToken`, non-empty `RefreshToken`, and `ExpiresAt` in the future |
| `HandleAsync_UserNotFound_ThrowsInvalidCredentialsException` | Repository returns `null` | Throws `InvalidCredentialsException` |
| `HandleAsync_WrongPassword_ThrowsInvalidCredentialsException` | User exists but hash does not match | Throws `InvalidCredentialsException` |

The last two tests assert the same exception type — this is the user-enumeration defense: callers cannot distinguish "email not found" from "wrong password" by observing error types or messages.

### `GetMeHandlerTests`

| Test | Scenario | Expected |
|---|---|---|
| `HandleAsync_UserExists_ReturnsGetMeResultWithEntityFields` | User found by id | Returns `GetMeResult` with correct `Id`, `Name`, `Email`, `CreatedAt`. The test also sets `PasswordHash` on the entity to confirm it is **not** present in the result |
| `HandleAsync_UserNotFound_ThrowsUserNotFoundException` | Repository returns `null` (user deleted after token was issued) | Throws `UserNotFoundException` |

`UserNotFoundException` is distinct from `InvalidCredentialsException` — in an authenticated context the caller owns the token, so a `404` carries no enumeration risk.

---

### `RefreshHandlerTests`

Mocks both `IRefreshTokenRepository` and `IUserRepository`; `JwtSettings` is a hand-built POCO (no config file needed).

| Test | Scenario | Expected |
|---|---|---|
| `HandleAsync_ValidRefreshToken_ReturnsNewPairAndRotatesOldToken` | Token found, not expired, not revoked | Returns new `AccessToken` and a **different** `RefreshToken` string; verifies `RevokeAsync` called once and `AddAsync` called once — both sides of rotation are asserted |
| `HandleAsync_ExpiredToken_ThrowsInvalidRefreshTokenException` | `ExpiresAt` in the past, `IsRevoked = false` | Throws `InvalidRefreshTokenException`; verifies no write (`RevokeAsync` / `AddAsync` never called) |
| `HandleAsync_RevokedToken_ThrowsInvalidRefreshTokenException` | `IsRevoked = true`, `ExpiresAt` in the future | Throws `InvalidRefreshTokenException`; verifies no write |

The last two tests assert the same exception type and confirm no side effects — each failure mode independently aborts before any rotation write, which is the invariant that prevents partial rotation leaving two live tokens.

---

### `MeiHandlerTests`

Tests are distributed across `CreateMeiHandler` and `GetMeiHandler`. The two ownership-failure cases (`MeiNotFoundException`, `UnauthorizedAccessException`) only arise in handlers that load an existing MEI (Get/Update/Delete). Testing them once on `GetMei` is sufficient — the ownership check is line-for-line identical in `UpdateMei` and `DeleteMei`.

| Test | Handler | Scenario | Expected |
|---|---|---|---|
| `CreateMeiHandler_HandleAsync_ValidData_CallsAddAsyncOnce` | `CreateMeiHandler` | No pre-existing MEIs; valid command | `AddAsync` called once; returned `MeiResult.Id` is non-empty and fields match the command |
| `GetMeiHandler_HandleAsync_MeiNotFound_ThrowsMeiNotFoundException` | `GetMeiHandler` | Repository returns `null` | Throws `MeiNotFoundException` — not `UnauthorizedAccessException` — so callers can distinguish a genuine miss from an ownership violation |
| `GetMeiHandler_HandleAsync_DifferentOwner_ThrowsUnauthorizedAccessException` | `GetMeiHandler` | Row exists but `mei.UserId` ≠ `query.UserId` | Throws `UnauthorizedAccessException`; confirms multi-tenant boundary — any authenticated user guessing another user's GUID must not receive the row |

---

### `CreateTransactionHandlerTests`

Mocks both `ITransactionRepository` and `IMeiRepository`. Tests confirm the critical ordering: ownership is checked before type validation, so a malicious caller probing another user's MEI always gets `403`, never a helpful type-error hint.

| Test | Scenario | Expected |
|---|---|---|
| `HandleAsync_ValidData_CallsAddAsyncOnce` | Caller owns the MEI, `type = "income"` | `AddAsync` called once; `TransactionResult` has correct `MeiId`, `Type`, `Amount` and a non-empty `Id` |
| `HandleAsync_MeiOwnedByDifferentUser_ThrowsUnauthorizedAccessException` | MEI exists but `mei.UserId ≠ command.UserId` | Throws `UnauthorizedAccessException`; `AddAsync` never called — handler aborted before touching the transactions table |
| `HandleAsync_InvalidType_ThrowsInvalidTransactionTypeException` | Caller owns the MEI, `type = "transfer"` | Throws `InvalidTransactionTypeException`; `AddAsync` never called |

---

## Smoke Tests

An end-to-end bash script exercises the full transactions surface against a running API:

```
apps/scripts/tests/test-transactions.sh
```

Steps: register (tolerates 409 on reruns) → login → create MEI with unique CNPJ → create 3 transactions → assert list length (3 total, 2 income) → update amount → assert amount in GET → delete → assert 404 on deleted.

---

## Running

```bash
# from the repo root
dotnet test tests/Core.UnitTests

# with coverage
dotnet test tests/Core.UnitTests --collect:"XPlat Code Coverage"
```
