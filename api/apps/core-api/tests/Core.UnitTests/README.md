# Core.UnitTests

Unit tests for business logic in `Core.Application`. Tests run in-process with no database, no HTTP pipeline, and no file system — every external collaborator is replaced by a Moq double.

```
Core.UnitTests/
└── Auth/
    ├── RegisterHandlerTests.cs   ← 2 tests for the Register use case
    ├── LoginHandlerTests.cs      ← 3 tests for the Login use case
    ├── GetMeHandlerTests.cs      ← 2 tests for the GetMe use case
    └── RefreshHandlerTests.cs    ← 3 tests for the Refresh use case
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

## Running

```bash
# from the repo root
dotnet test tests/Core.UnitTests

# with coverage
dotnet test tests/Core.UnitTests --collect:"XPlat Code Coverage"
```
