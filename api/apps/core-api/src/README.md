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
├── Entities/      ← aggregate roots and domain entities (e.g. User, Order)
└── Interfaces/    ← repository contracts, domain service interfaces
```

Intended contents: Entities, Value Objects, Domain Events, Domain Exceptions, Business Invariants.

---

### `Core.Infrastructure` — Infrastructure / Data Layer

| | |
|---|---|
| SDK | `Microsoft.NET.Sdk` (class library) |
| Role | Technical implementations: database, file system, external APIs |
| References | `Core.Domain` |
| NuGet | none (ORM not yet configured) |

```
Core.Infrastructure/
└── Persistence/
    └── Repositories/   ← implementations of IRepository interfaces from Core.Domain
```

Intended contents: EF Core `DbContext`, repository implementations, migrations, third-party API clients, caching adapters.

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
| **CoreApi** | Scaffold only — default WeatherForecast minimal API |
| **Core.Application** | Empty placeholder |
| **Core.Domain** | Folders created, no entities or interfaces yet |
| **Core.Infrastructure** | Persistence folder scaffolded, no ORM yet |
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
