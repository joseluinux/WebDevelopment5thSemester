# Core.Application

The use-case layer. Orchestrates domain objects to fulfil the application's business operations. Depends on `Core.Domain` (interfaces and entities) and has no knowledge of HTTP, databases, or any framework.

```
Core.Application/
├── Auth/
│   ├── JwtSettings.cs          ← strongly-typed POCO for JWT configuration
│   └── TokenFactory.cs         ← internal helper: JWT signing + CSPRNG refresh-token generation
└── UseCases/
    └── Auth/
        ├── Register/
        │   ├── RegisterCommand.cs
        │   └── RegisterHandler.cs
        ├── Login/
        │   ├── LoginCommand.cs
        │   ├── LoginHandler.cs
        │   └── LoginResult.cs
        ├── GetMe/
        │   ├── GetMeQuery.cs
        │   ├── GetMeHandler.cs
        │   └── GetMeResult.cs
        ├── Refresh/
        │   ├── RefreshCommand.cs
        │   ├── RefreshHandler.cs
        │   └── RefreshResult.cs
        └── Logout/
            ├── LogoutCommand.cs
            └── LogoutHandler.cs
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

## Adding a New Use Case

1. Create a folder under `UseCases/<Feature>/<Action>/`.
2. Add a `<Action>Command.cs` record with the input fields.
3. Add a `<Action>Handler.cs` class. Inject only interfaces from `Core.Domain`.
4. If the use case returns data, add a `<Action>Result.cs` record.
5. Register the handler in `CoreApi/Program.cs` with `builder.Services.AddScoped<YourHandler>()`.
6. Add a controller action in `CoreApi/Controllers/` that maps HTTP ↔ command/result.
