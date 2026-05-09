# Core.Infrastructure

The persistence layer. Provides concrete implementations of the repository interfaces defined in `Core.Domain`, backed by Entity Framework Core and a PostgreSQL database hosted on Supabase.

Depends on: `Core.Domain`, `Core.Application` (for entity types), EF Core, Npgsql.

```
Core.Infrastructure/
└── Persistence/
    ├── AppDbContext.cs
    └── Repositories/
        └── UserRepository.cs
```

---

## `Persistence/AppDbContext`

`AppDbContext` is the EF Core unit-of-work. It maps every domain entity to its PostgreSQL table and configures column names, constraints, indexes, and default values to match the Supabase schema.

### DbSets

| Property | Table |
|---|---|
| `Users` | `users` |
| `Meis` | `meis` |
| `Employees` | `employees` |
| `Products` | `products` |
| `Transactions` | `transactions` |
| `Imports` | `imports` |
| `Documents` | `documents` |
| `AiRecommendations` | `ai_recommendations` |

### Notable model configuration

- All primary keys use `uuid_generate_v4()` as the database default (PostgreSQL `uuid-ossp` extension).
- `Transactions.import_id` has `ON DELETE SET NULL` — deleting an `Import` orphans its transactions rather than cascading.
- `users.email` and `meis.cnpj` carry unique constraints enforced both at the database level and via domain exceptions.
- Supabase platform enums (`auth.*`, `realtime.*`, `storage.*`) are registered via `HasPostgresEnum` so EF Core is aware of them without mapping them to C# types.
- `AppContext.SetSwitch("Npgsql.EnableLegacyTimestampBehavior", true)` is set in `CoreApi/Program.cs` to keep `DateTime` columns working with `timestamp without time zone` columns.

---

## `Persistence/Repositories/UserRepository`

Implements `IUserRepository` (defined in `Core.Domain.Interfaces`).

| Method | EF operation |
|---|---|
| `GetByEmailAsync` | `FirstOrDefaultAsync` — returns `null` when not found, matching the nullable contract |
| `AddAsync` | `AddAsync` + `SaveChangesAsync` — stages and flushes in a single transaction |

The repository takes `AppDbContext` via constructor injection. It never returns EF-tracked objects outside its own methods — callers in `Core.Application` receive plain entity instances.

---

## Connection Setup

The connection string is read from `appsettings.json` under the key `ConnectionStrings:DefaultConnection`. For local development, override it in `appsettings.Development.json` (git-ignored).

```json
"ConnectionStrings": {
  "DefaultConnection": "Host=...;Database=...;Username=...;Password=..."
}
```

The Supabase connection string (Npgsql format) is available in the Supabase dashboard under **Project Settings → Database → Connection string → .NET**.

---

## Adding a New Repository

1. Define the interface in `Core.Domain/Interfaces/I<Entity>Repository.cs`.
2. Create `Core.Infrastructure/Persistence/Repositories/<Entity>Repository.cs` implementing that interface.
3. Register the binding in `CoreApi/Program.cs`:
   ```csharp
   builder.Services.AddScoped<I<Entity>Repository, <Entity>Repository>();
   ```
