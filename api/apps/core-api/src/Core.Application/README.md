# Core.Application

The use-case layer. Orchestrates domain objects to fulfil the application's business operations. Depends on `Core.Domain` (interfaces and entities) and has no knowledge of HTTP, databases, or any framework.

```
Core.Application/
├── Auth/
│   └── JwtSettings.cs          ← strongly-typed POCO for JWT configuration
└── UseCases/
    └── Auth/
        ├── Register/
        │   ├── RegisterCommand.cs
        │   └── RegisterHandler.cs
        └── Login/
            ├── LoginCommand.cs
            ├── LoginHandler.cs
            └── LoginResult.cs
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

`JwtSettings` lives in `Core.Application` so both the `LoginHandler` (which signs tokens) and `CoreApi` (which validates them) can share the exact same type — preventing issuer/audience drift between the two sides.

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
3. Generate a signed JWT access token (HMAC-SHA256, claims: `sub`, `email`, `jti`).
4. Generate a 64-byte CSPRNG refresh token (opaque, base64-encoded).
5. Return a `LoginResult` with both tokens and the absolute expiry timestamp.

**Input:** `LoginCommand(string Email, string Password)`

**Output:** `LoginResult(string AccessToken, string RefreshToken, DateTime ExpiresAt)`

**Security note:** both "email not found" and "wrong password" throw the same `InvalidCredentialsException` with the same generic message. This prevents user-enumeration attacks where an attacker could learn which emails exist by observing different error responses.

**Exceptions thrown:**
- `InvalidCredentialsException` — credentials did not match (→ `401 Unauthorized`).

---

## Adding a New Use Case

1. Create a folder under `UseCases/<Feature>/<Action>/`.
2. Add a `<Action>Command.cs` record with the input fields.
3. Add a `<Action>Handler.cs` class. Inject only interfaces from `Core.Domain`.
4. If the use case returns data, add a `<Action>Result.cs` record.
5. Register the handler in `CoreApi/Program.cs` with `builder.Services.AddScoped<YourHandler>()`.
6. Add a controller action in `CoreApi/Controllers/` that maps HTTP ↔ command/result.
