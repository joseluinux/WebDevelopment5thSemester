# CoreApi

The presentation and composition root layer. Hosts the ASP.NET Core Web API, wires the entire dependency graph together in `Program.cs`, and translates HTTP requests into application-layer commands.

Depends on: `Core.Application`, `Core.Infrastructure`, `Core.Domain`.

```
CoreApi/
├── Program.cs               ← DI composition root + middleware pipeline
├── appsettings.json         ← default configuration (checked in, no secrets)
├── appsettings.Development.json  ← local overrides (git-ignored)
├── Controllers/
│   ├── AuthController.cs        ← all /v1/auth/* endpoints
│   ├── MeiController.cs         ← all /v1/meis/* endpoints
│   ├── TransactionsController.cs ← all /v1/meis/{meiId}/transactions/* endpoints
│   └── ProductsController.cs     ← all /v1/meis/{meiId}/products/* endpoints
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
| `IRefreshTokenRepository` | Scoped | `RefreshTokenRepository` |
| `IMeiRepository` | Scoped | `MeiRepository` |
| `RegisterHandler` | Scoped | concrete class |
| `LoginHandler` | Scoped | concrete class |
| `GetMeHandler` | Scoped | concrete class |
| `RefreshHandler` | Scoped | concrete class |
| `LogoutHandler` | Scoped | concrete class |
| `GetMeisHandler` | Scoped | concrete class |
| `GetMeiHandler` | Scoped | concrete class |
| `CreateMeiHandler` | Scoped | concrete class |
| `UpdateMeiHandler` | Scoped | concrete class |
| `DeleteMeiHandler` | Scoped | concrete class |
| `ITransactionRepository` | Scoped | `TransactionRepository` |
| `GetTransactionsHandler` | Scoped | concrete class |
| `GetTransactionHandler` | Scoped | concrete class |
| `CreateTransactionHandler` | Scoped | concrete class |
| `UpdateTransactionHandler` | Scoped | concrete class |
| `DeleteTransactionHandler` | Scoped | concrete class |
| `IProductRepository` | Scoped | `ProductRepository` |
| `GetProductsHandler` | Scoped | concrete class |
| `GetProductHandler` | Scoped | concrete class |
| `CreateProductHandler` | Scoped | concrete class |
| `UpdateProductHandler` | Scoped | concrete class |
| `DeleteProductHandler` | Scoped | concrete class |

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

### Swagger / OpenAPI

A global JWT Bearer security definition is registered via `AddSecurityDefinition` + `AddSecurityRequirement` (Microsoft.OpenApi 2.x API). The Swagger UI exposes an "Authorize" button so protected endpoints can be tested without an external client.

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

### `POST /v1/auth/refresh`

Exchanges a still-valid refresh token for a new access/refresh-token pair (rotation). Intentionally **not** decorated with `[Authorize]` — the access token has usually already expired by the time this is called, and the refresh token itself is the credential.

Request body (`TokenDto`):
```json
{ "token": "<refresh token string>" }
```

| Outcome | HTTP response |
|---|---|
| Success | `200 OK` `{ "accessToken": "...", "refreshToken": "...", "expiresAt": "..." }` |
| Token not found / expired / revoked | `401 Unauthorized` `{ "error": "Invalid refresh token." }` |

---

### `POST /v1/auth/logout` — requires `Authorization: Bearer <token>`

Revokes the supplied refresh token. Protected with `[Authorize]` — the caller must present a valid access token in addition to the refresh token, raising the bar for an attacker who holds only one of the two.

Request body (`TokenDto`):
```json
{ "token": "<refresh token string>" }
```

| Outcome | HTTP response |
|---|---|
| Success | `200 OK` (empty body) |
| Missing/invalid JWT | `401 Unauthorized` (auto, by `[Authorize]`) |
| Refresh token unknown or already revoked | `401 Unauthorized` `{ "error": "Invalid refresh token." }` |

---

## Auth DTOs (`AuthController.cs`)

All auth DTOs are defined as `record` types directly in `AuthController.cs`.

| DTO | Used by |
|---|---|
| `RegisterDto(string Name, string Email, string Password)` | `POST /register` |
| `LoginDto(string Email, string Password)` | `POST /login` |
| `TokenDto(string Token)` | `POST /refresh` and `POST /logout` (same wire format) |

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
    "AccessTokenExpirationMinutes": 15,
    "RefreshTokenExpirationDays": 30
  }
}
```

`appsettings.json` is checked in with placeholder values. Real values are supplied via `appsettings.Development.json` (local, git-ignored) or environment variables / secret manager in production.

---

---

## `Controllers/MeiController`

Base route: `v1/meis`. `[Authorize]` is applied at the **class level** — every action requires a valid JWT without needing per-action decoration.

Every action calls `TryGetUserId()`, a private helper that reads `ClaimTypes.NameIdentifier` and `JwtRegisteredClaimNames.Sub` (same defensive dual-claim pattern as `AuthController`) and parses the result as a `Guid`. A malformed subject returns `401` immediately, before the handler is called.

`UserId` is **never** read from the URL or request body — the body has no `UserId` field on `CreateMeiDto` or `UpdateMeiDto`. This is the core multi-tenant guarantee.

### `GET /v1/meis`

| Outcome | HTTP response |
|---|---|
| Success | `200 OK` — JSON array of `MeiResult` (empty array if none) |
| Missing/invalid JWT | `401` (auto) |

### `POST /v1/meis`

Request body (`CreateMeiDto`): `{ "name", "cnpj"?, "cnae"?, "annualLimit"?, "plan"? }`

| Outcome | HTTP response |
|---|---|
| Success | `201 Created` + `Location: /v1/meis/{id}` + `MeiResult` body |
| Missing/invalid JWT | `401` (auto) |
| Duplicate CNPJ for this user | `409 Conflict` `{ "error": "..." }` |

### `GET /v1/meis/{meiId}`

| Outcome | HTTP response |
|---|---|
| Success | `200 OK` + `MeiResult` |
| Missing/invalid JWT | `401` (auto) |
| MEI not found | `404 Not Found` `{ "error": "MEI with id '...' was not found." }` |
| MEI belongs to another user | `403 Forbidden` `{ "error": "You do not have access to this MEI." }` |

### `PUT /v1/meis/{meiId}`

Request body (`UpdateMeiDto`): `{ "name", "cnae"?, "annualLimit"?, "plan"? }` — `cnpj` is excluded by design.

| Outcome | HTTP response |
|---|---|
| Success | `200 OK` + updated `MeiResult` |
| Missing/invalid JWT | `401` (auto) |
| MEI not found | `404 Not Found` |
| MEI belongs to another user | `403 Forbidden` |

### `DELETE /v1/meis/{meiId}`

| Outcome | HTTP response |
|---|---|
| Success | `204 No Content` |
| Missing/invalid JWT | `401` (auto) |
| MEI not found | `404 Not Found` |
| MEI belongs to another user | `403 Forbidden` |

### DTOs

| DTO | Fields |
|---|---|
| `CreateMeiDto` | `Name`, `Cnpj?`, `Cnae?`, `AnnualLimit?`, `Plan?` |
| `UpdateMeiDto` | `Name`, `Cnae?`, `AnnualLimit?`, `Plan?` |

Neither DTO has a `UserId` field — ownership is always derived from the JWT, never from the body.

---

---

## `Controllers/TransactionsController`

Base route: `v1/meis/{meiId:guid}/transactions`. `[Authorize]` at the class level. The `meiId` GUID route constraint causes ASP.NET Core to return `404` automatically for non-GUID values before any action runs.

Every action uses the same `TryGetUserId()` helper (dual claim-name check) as the other controllers. Neither DTO carries `MeiId` or `UserId` — both come from the URL and JWT respectively.

### `GET /v1/meis/{meiId}/transactions`

All query-string filters are optional. Any omitted parameter is passed as `null` through to the repository, which skips it.

Query params: `from` (`DateOnly`), `to` (`DateOnly`), `type` (`income`|`expense`), `category` (string)

| Outcome | HTTP |
|---|---|
| Success | `200 OK` — JSON array of `TransactionResult`, newest first |
| Missing/invalid JWT | `401` (auto) |
| MEI not found | `404` |
| MEI owned by another user | `403` |

### `GET /v1/meis/{meiId}/transactions/{id}`

| Outcome | HTTP |
|---|---|
| Success | `200 OK` + `TransactionResult` |
| Missing/invalid JWT | `401` (auto) |
| MEI not found | `404` |
| MEI owned by another user | `403` |
| Transaction not found or belongs to a different MEI | `404` |

### `POST /v1/meis/{meiId}/transactions`

Request body (`CreateTransactionDto`): `{ "type", "category"?, "amount", "date", "description"? }`

| Outcome | HTTP |
|---|---|
| Success | `201 Created` + `Location` header + `TransactionResult` body |
| Missing/invalid JWT | `401` (auto) |
| MEI not found | `404` |
| MEI owned by another user | `403` |
| Invalid type value | `400 Bad Request` `{ "error": "Invalid transaction type '...'. Allowed: income, expense." }` |

### `PUT /v1/meis/{meiId}/transactions/{id}`

Request body (`UpdateTransactionDto`): `{ "type", "category"?, "amount", "date", "description"? }`

| Outcome | HTTP |
|---|---|
| Success | `200 OK` + updated `TransactionResult` |
| Missing/invalid JWT | `401` (auto) |
| MEI not found | `404` |
| MEI owned by another user | `403` |
| Transaction not found or belongs to a different MEI | `404` |
| Invalid type value | `400` |

### `DELETE /v1/meis/{meiId}/transactions/{id}`

| Outcome | HTTP |
|---|---|
| Success | `204 No Content` |
| Missing/invalid JWT | `401` (auto) |
| MEI not found | `404` |
| MEI owned by another user | `403` |
| Transaction not found or belongs to a different MEI | `404` |

### DTOs

| DTO | Fields |
|---|---|
| `CreateTransactionDto` | `Type`, `Category?`, `Amount`, `Date`, `Description?` |
| `UpdateTransactionDto` | `Type`, `Category?`, `Amount`, `Date`, `Description?` |

Neither DTO has a `MeiId` or `UserId` field — those come from the URL path and JWT.

---

---

## `Controllers/ProductsController`

Base route: `v1/meis/{meiId:guid}/products`. `[Authorize]` at the class level. Same `TryGetUserId()` dual-claim helper as `TransactionsController`. Neither DTO carries `MeiId` or `UserId`.

### `GET /v1/meis/{meiId}/products`

Query param: `status` (`"active"` | `"inactive"`) — optional.

| Outcome | HTTP |
|---|---|
| Success | `200 OK` — JSON array of `ProductResult`, newest first then by name |
| Missing/invalid JWT | `401` (auto) |
| MEI not found | `404` |
| MEI owned by another user | `403` |

Each row includes `margin` (gross-margin %) and `isMarginBelowDesired` (bool) computed from `Cost`/`Price`/`DesiredMargin`.

### `GET /v1/meis/{meiId}/products/{id}`

| Outcome | HTTP |
|---|---|
| Success | `200 OK` + `ProductResult` |
| Missing/invalid JWT | `401` (auto) |
| MEI not found | `404` |
| MEI owned by another user | `403` |
| Product not found or belongs to a different MEI | `404` |

### `POST /v1/meis/{meiId}/products`

Request body (`CreateProductDto`): `{ "name", "cost", "price", "desiredMargin", "status" }`

All fields required; `cost` and `price` are `decimal`, `status` must be `"active"` or `"inactive"`, `price` must be `> 0`.

| Outcome | HTTP |
|---|---|
| Success | `201 Created` + `Location` + `ProductResult` body |
| Missing/invalid JWT | `401` (auto) |
| MEI not found | `404` |
| MEI owned by another user | `403` |
| Invalid status | `400 Bad Request` |
| Price ≤ 0 | `400 Bad Request` |

### `PUT /v1/meis/{meiId}/products/{id}`

Request body (`UpdateProductDto`): same fields as `CreateProductDto`.

| Outcome | HTTP |
|---|---|
| Success | `200 OK` + updated `ProductResult` |
| Missing/invalid JWT | `401` (auto) |
| MEI not found | `404` |
| MEI owned by another user | `403` |
| Product not found or belongs to a different MEI | `404` |
| Invalid status | `400` |
| Price ≤ 0 | `400` |

### `DELETE /v1/meis/{meiId}/products/{id}`

| Outcome | HTTP |
|---|---|
| Success | `204 No Content` |
| Missing/invalid JWT | `401` (auto) |
| MEI not found | `404` |
| MEI owned by another user | `403` |
| Product not found or belongs to a different MEI | `404` |

### DTOs

| DTO | Fields |
|---|---|
| `CreateProductDto` | `Name`, `Cost`, `Price`, `DesiredMargin`, `Status` |
| `UpdateProductDto` | `Name`, `Cost`, `Price`, `DesiredMargin`, `Status` |

---

## Adding a New Endpoint

1. Implement the use case in `Core.Application/UseCases/<Feature>/`.
2. Register the handler in `Program.cs` (`builder.Services.AddScoped<YourHandler>()`).
3. Add a controller (or a new action to an existing controller) in `Controllers/`.
4. Define request/response DTOs as `record` types in the same controller file.
5. Map HTTP body → command → handler → result → HTTP response.
