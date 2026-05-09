# CoreApi

The presentation and composition root layer. Hosts the ASP.NET Core Web API, wires the entire dependency graph together in `Program.cs`, and translates HTTP requests into application-layer commands.

Depends on: `Core.Application`, `Core.Infrastructure`, `Core.Domain`.

```
CoreApi/
├── Program.cs               ← DI composition root + middleware pipeline
├── appsettings.json         ← default configuration (checked in, no secrets)
├── appsettings.Development.json  ← local overrides (git-ignored)
├── Controllers/
│   └── AuthController.cs   ← POST /v1/auth/register, POST /v1/auth/login
└── Middlewares/             ← custom middleware (empty — reserved for future use)
```

---

## NuGet Dependencies

| Package | Version | Why |
|---|---|---|
| `Microsoft.AspNetCore.Authentication.JwtBearer` | 9.0.4 | JWT bearer middleware for validating access tokens |
| `Swashbuckle.AspNetCore` | 10.1.7 | Swagger/OpenAPI UI (`/swagger`) in development |
| `Microsoft.EntityFrameworkCore.Design` | 9.0.4 | EF Core CLI tooling (`dotnet ef migrations`) — dev-only |

---

## `Program.cs` — Composition Root

All dependency wiring happens here. Nothing is auto-discovered; every binding is explicit.

### Services registered

| Service | Lifetime | Binding |
|---|---|---|
| `AppDbContext` | Scoped | `UseNpgsql(connectionString)` |
| `JwtSettings` | Singleton | Bound from `appsettings.json → JwtSettings` section |
| `IUserRepository` | Scoped | `UserRepository` |
| `RegisterHandler` | Scoped | concrete class |
| `LoginHandler` | Scoped | concrete class |
| `GetMeHandler` | Scoped | concrete class |

`JwtSettings` is registered as the concrete type (not `IOptions<JwtSettings>`) so handlers can take a plain dependency — keeping `Core.Application` free of `Microsoft.Extensions.Options` coupling and making unit tests trivial (`new JwtSettings { ... }`).

### Middleware pipeline

```
HTTPS Redirection
  → Authentication (JwtBearer)
    → Authorization
      → Controllers
```

Authentication **must** run before Authorization. The JWT validator uses the same `JwtSettings` instance that `LoginHandler` uses to sign tokens, so issuer/audience/key are guaranteed to match.

### JWT validation parameters

| Parameter | Value |
|---|---|
| Issuer | `LumeMEI.CoreApi` (from config) |
| Audience | `LumeMEI.Clients` (from config) |
| Signing algorithm | HMAC-SHA256 |
| `ClockSkew` | `TimeSpan.Zero` — expiry is exact, no slack |

---

## `Controllers/AuthController`

Base route: `v1/auth`

Controllers are intentionally thin: they receive the HTTP body, map it to an application command, delegate to the handler, and translate outcomes back to HTTP status codes. No business logic lives here.

### `POST /v1/auth/register`

Request body (`RegisterDto`):
```json
{ "name": "Maria", "email": "maria@example.com", "password": "secret123" }
```

| Outcome | HTTP response |
|---|---|
| Success | `201 Created` (empty body) |
| Email already taken | `409 Conflict` `{ "error": "Email '...' is already taken." }` |

### `GET /v1/auth/me` — requires `Authorization: Bearer <token>`

Requires a valid JWT. `[Authorize]` causes ASP.NET Core to reject requests with a missing or invalid token with `401` before the action body runs.

The subject claim is read defensively from both `ClaimTypes.NameIdentifier` (ASP.NET Core's default inbound-claim mapping of `sub`) and `JwtRegisteredClaimNames.Sub` (the raw claim), so the endpoint keeps working regardless of whether inbound claim mapping is enabled or disabled in the bearer pipeline.

| Outcome | HTTP response |
|---|---|
| Success | `200 OK` `{ "id": "...", "name": "...", "email": "...", "createdAt": "..." }` |
| Missing/invalid JWT | `401 Unauthorized` (auto, by `[Authorize]`) |
| JWT valid, `sub` missing or not a `Guid` | `401 Unauthorized` `{ "error": "Invalid token subject." }` |
| JWT valid, user deleted | `404 Not Found` `{ "error": "User with id '...' was not found." }` |

---

### `POST /v1/auth/login`

Request body (`LoginDto`):
```json
{ "email": "maria@example.com", "password": "secret123" }
```

| Outcome | HTTP response |
|---|---|
| Success | `200 OK` `{ "accessToken": "...", "refreshToken": "...", "expiresAt": "..." }` |
| Wrong credentials | `401 Unauthorized` `{ "error": "Invalid credentials." }` |

---

## DTOs

`RegisterDto` and `LoginDto` are defined directly in `AuthController.cs` as `record` types. They are presentation-layer objects whose shape is dictated by the HTTP API, not by any domain concept. They must not be reused in `Core.Application` or `Core.Domain`.

---

## Configuration (`appsettings.json`)

```json
{
  "ConnectionStrings": {
    "DefaultConnection": "<postgres connection string>"
  },
  "JwtSettings": {
    "Secret": "<min 32-char random string>",
    "Issuer": "LumeMEI.CoreApi",
    "Audience": "LumeMEI.Clients",
    "AccessTokenExpirationMinutes": 15
  }
}
```

`appsettings.json` is checked in with placeholder values. Real values are supplied via `appsettings.Development.json` (local, git-ignored) or environment variables / secret manager in production.

---

## Adding a New Endpoint

1. Implement the use case in `Core.Application/UseCases/<Feature>/`.
2. Register the handler in `Program.cs` (`builder.Services.AddScoped<YourHandler>()`).
3. Add a controller (or a new action to an existing controller) in `Controllers/`.
4. Define request/response DTOs as `record` types in the same controller file.
5. Map HTTP body → command → handler → result → HTTP response.
