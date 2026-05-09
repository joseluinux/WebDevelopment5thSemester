# Core.UnitTests

Unit tests for business logic in `Core.Application`. Tests run in-process with no database, no HTTP pipeline, and no file system — every external collaborator is replaced by a Moq double.

```
Core.UnitTests/
└── Auth/
    ├── RegisterHandlerTests.cs   ← 3 tests for the Register use case
    └── LoginHandlerTests.cs      ← 3 tests for the Login use case
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

---

## Running

```bash
# from the repo root
dotnet test tests/Core.UnitTests

# with coverage
dotnet test tests/Core.UnitTests --collect:"XPlat Code Coverage"
```
