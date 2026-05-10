# core-api — Architecture Reference

## Overview

**Platform**: .NET 9 (ASP.NET Core Web API)  
**Pattern**: Clean Architecture (Layered / Onion)

The solution is organised into two top-level folders:

```
CoreApi.sln
├── src/       ← production code (4 projects)
└── tests/     ← test code (2 projects)
```

---

## Dependency Graph

```
                     ┌──────────────┐
                     │   CoreApi    │  ← Presentation (entry point)
                     └──────┬───┬──┘
                             │   │
              ┌──────────────┘   └────────────────┐
              ▼                                   ▼
  ┌───────────────────┐             ┌──────────────────────┐
  │  Core.Application │             │  Core.Infrastructure │
  └─────────┬─────────┘             └──────────┬───────────┘
             │                                  │
             └──────────────┬───────────────────┘
                            ▼
                   ┌─────────────────┐
                   │   Core.Domain   │  ← no external dependencies
                   └─────────────────┘
```

`Core.Application` does **not** reference `Core.Infrastructure`. Repository interfaces are declared in `Core.Domain`, implemented in `Core.Infrastructure`, and wired together at `CoreApi` (the composition root). This enforces the Dependency Inversion Principle.

---

## Projects

### `CoreApi` — Presentation / Entry Point

| | |
|---|---|
| SDK | `Microsoft.NET.Sdk.Web` |
| Role | HTTP host, routing, middleware pipeline, DI composition root |
| References | `Core.Application`, `Core.Infrastructure` |
| NuGet | `Microsoft.AspNetCore.OpenApi 9.0.14` |

```
CoreApi/
├── Program.cs                     ← app bootstrap and DI wiring
├── appsettings.json               ← base configuration
├── appsettings.Development.json   ← development overrides
├── Properties/
│   └── launchSettings.json        ← local dev profiles (HTTP :5027 / HTTPS :7093)
├── Controllers/                   ← ControllerBase classes or endpoint groups
└── Middlewares/                   ← custom middleware (error handling, auth, etc.)
```

---

### `Core.Application` — Application / Use-Case Layer

| | |
|---|---|
| SDK | `Microsoft.NET.Sdk` (class library) |
| Role | Orchestrates business use cases — the "what the app does" |
| References | `Core.Domain` only |
| NuGet | none |

Intended contents: Commands & Queries (CQRS handlers), DTOs, Application Services, Validators, interface definitions for external services (e.g. `IEmailService`).

---

### `Core.Domain` — Domain Layer (innermost)

| | |
|---|---|
| SDK | `Microsoft.NET.Sdk` (class library) |
| Role | Pure business rules — no framework or infrastructure dependencies |
| References | none |
| NuGet | none |

```
Core.Domain/
├── Entities/
│   ├── User.cs               ← platform account (email, passwordHash)
│   ├── Mei.cs                ← MEI business registration (CNPJ, CNAE, annualLimit, plan)
│   ├── Employee.cs           ← employee linked to a Mei (salary, charges, contractType)
│   ├── Product.cs            ← product/service catalog (cost, price, desiredMargin, status)
│   ├── Transaction.cs        ← financial transaction (type, category, amount, date)
│   ├── Import.cs             ← bulk file import job (fileUri, status, processedRows, errors)
│   ├── Document.cs           ← document/file linked to a Mei (title, content, fileUri)
│   └── AiRecommendation.cs   ← AI-generated insight for a Mei (type, content, metadata)
└── Interfaces/               ← repository contracts (not yet defined)
```

**Domain — this is a MEI management platform.** MEI (Microempreendedor Individual) is a Brazilian simplified business registration. Each `User` can own one or more `Mei` businesses. All other entities belong to a `Mei`.

#### Entity relationships

```
User ──< Mei ──< Employee
              ├─< Product
              ├─< Transaction >── Import
              ├─< Document
              ├─< Import
              └─< AiRecommendation
```

| Entity | Key fields | Belongs to |
|---|---|---|
| `User` | `Id`, `Email`, `PasswordHash`, `Name` | — (root) |
| `Mei` | `Id`, `UserId`, `Cnpj`, `Cnae`, `AnnualLimit`, `Plan` | `User` |
| `Employee` | `Id`, `MeiId`, `Name`, `ContractType`, `Salary`, `Charges` | `Mei` |
| `Product` | `Id`, `MeiId`, `Name`, `Cost`, `Price`, `DesiredMargin`, `Status` | `Mei` |
| `Transaction` | `Id`, `MeiId`, `ImportId?`, `Type`, `Category`, `Amount`, `Date` | `Mei`, optionally `Import` |
| `Import` | `Id`, `MeiId`, `FileUri`, `Status`, `TotalRows`, `ProcessedRows`, `Errors` | `Mei` |
| `Document` | `Id`, `MeiId`, `Title`, `Content`, `FileUri` | `Mei` |
| `AiRecommendation` | `Id`, `MeiId`, `Type`, `Content`, `Metadata` | `Mei` |

> **Note**: entities were scaffold-generated and currently carry `namespace Core.Infrastructure` instead of `Core.Domain`. This should be corrected to match their physical location.

---

### `Core.Infrastructure` — Infrastructure / Data Layer

| | |
|---|---|
| SDK | `Microsoft.NET.Sdk` (class library) |
| Role | Technical implementations: database, file system, external APIs |
| References | `Core.Domain` |
| NuGet | `Npgsql.EntityFrameworkCore.PostgreSQL 9.0.4` |

```
Core.Infrastructure/
└── Persistence/
    ├── AppDbContext.cs     ← EF Core DbContext; all 8 DbSets configured
    └── Repositories/       ← repository implementations (not yet created)
```

**Database**: PostgreSQL (Supabase-hosted, evidenced by `auth`, `realtime`, and `storage` schema enums registered in `OnModelCreating`). Extensions in use: `uuid-ossp`, `pgcrypto`, `pg_stat_statements`, `vector`.

`AppDbContext` registers all 8 entities as `DbSet<T>` and configures full column mappings, indexes, FK constraints, and default values via the Fluent API in `OnModelCreating`.

---

## Test Projects

### `Core.UnitTests`

| | |
|---|---|
| Framework | xUnit 2.9.2 + coverlet |
| References | `Core.Application`, `Core.Domain` |
| Scope | Pure logic tests — no I/O, no database |

Tests application services and domain rules in isolation.

### `Core.IntegrationTests`

| | |
|---|---|
| Framework | xUnit 2.9.2 + coverlet |
| References | `CoreApi`, `Core.Infrastructure` |
| Scope | End-to-end slice tests — HTTP + real infrastructure |

Intended for `WebApplicationFactory<>` tests that boot the full API pipeline.

---

## Current State

| Layer | Status |
|---|---|
| **CoreApi** | Scaffold only — default WeatherForecast minimal API, no real controllers yet |
| **Core.Application** | Empty placeholder — no use cases defined |
| **Core.Domain** | 8 entities defined; `Interfaces/` folder still empty |
| **Core.Infrastructure** | `AppDbContext` configured with PostgreSQL (Npgsql); `Repositories/` empty |
| **Tests** | Both projects created, placeholders only |

### Suggested next steps

1. Add domain entities and repository interfaces in `Core.Domain/`
2. Implement repositories and configure the ORM in `Core.Infrastructure/Persistence/`
3. Add use-case handlers and DTOs in `Core.Application/`
4. Register services in `CoreApi/Program.cs` and expose endpoints via `CoreApi/Controllers/`
5. Cover domain logic with unit tests and full flows with integration tests

---

## Development Order

`Core.Domain` is the foundation — every other project depends on it directly or transitively, so it is always the correct starting point.

| Step | Project | What to build |
|---|---|---|
| 1 | `Core.Domain` | Entities, Value Objects, Repository interfaces, Domain exceptions |
| 2 | `Core.Application` | Use-case handlers (Commands/Queries), DTOs, Application service interfaces |
| 3 | `Core.Infrastructure` | Repository implementations, ORM configuration, external service adapters |
| 4 | `CoreApi` | Controllers/endpoints, register all services in `Program.cs` |

### Why start with `Core.Domain`?

- It has **no dependencies** on any other project or framework, so it can be designed and tested in complete isolation.
- All business rules and invariants live here. Getting the model right first prevents structural mistakes from propagating up through all other layers.
- Repository interfaces defined here drive what `Core.Infrastructure` must implement, and what `Core.Application` can use — the domain dictates the contract, not the database.

### Before writing any code

Define the domain problem clearly:

- What are the main **entities** (e.g. `User`, `Product`, `Order`)?
- What are the **relationships** between them?
- What **business rules** must always hold (invariants)?
- What **operations** does the system need to perform (use cases)?

The answers to these questions directly map to what goes into `Core.Domain/Entities/` and `Core.Domain/Interfaces/`.
