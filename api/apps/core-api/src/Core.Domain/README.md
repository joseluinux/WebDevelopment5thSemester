# Core.Domain

The innermost layer of the Clean Architecture. Contains all business rules, entities, and contracts. Has **zero dependencies** on any other project or external framework — nothing references it except by intent, and it references nothing.

```
Core.Domain/
├── Entities/             ← domain entities (data model)
│   ├── User.cs
│   ├── Mei.cs
│   ├── Employee.cs
│   ├── Product.cs
│   ├── Transaction.cs
│   ├── Import.cs
│   ├── Document.cs
│   └── AiRecommendation.cs
└── Interfaces/           ← repository and service contracts (to be defined)
```

---

## Domain Context

This is the domain layer for **LumeMEI** — a management platform for MEI businesses.

> **MEI** (Microempreendedor Individual) is a Brazilian simplified business registration type with a capped annual revenue limit and a reduced tax regime.

Each `User` on the platform can register and manage one or more `Mei` businesses. All other entities belong to a `Mei`.

---

## Entity Map

```
User ──< Mei ──< Employee
              ├─< Product
              ├─< Transaction >──? Import
              ├─< Import ──< Transaction
              ├─< Document
              └─< AiRecommendation
```

---

## Entities

### `User`
Platform account. Owns one or more `Mei` businesses.

| Property | Type | Description |
|---|---|---|
| `Id` | `Guid` | Primary key (`uuid_generate_v4()`) |
| `Email` | `string` | Unique login identifier |
| `PasswordHash` | `string` | Hashed password |
| `Name` | `string?` | Display name |
| `CreatedAt` | `DateTime` | Record creation timestamp |
| `UpdatedAt` | `DateTime?` | Last update timestamp |

---

### `Mei`
A registered MEI business belonging to a `User`.

| Property | Type | Description |
|---|---|---|
| `Id` | `Guid` | Primary key |
| `UserId` | `Guid` | FK → `User` |
| `Name` | `string` | Business name |
| `Cnpj` | `string?` | Unique Brazilian business registration number |
| `Cnae` | `string?` | Activity classification code |
| `AnnualLimit` | `decimal?` | Annual revenue ceiling for the MEI regime |
| `Plan` | `string?` | Subscription plan on the platform |
| `CreatedAt` | `DateTime` | Record creation timestamp |
| `UpdatedAt` | `DateTime?` | Last update timestamp |

---

### `Employee`
An employee registered under a `Mei`.

| Property | Type | Description |
|---|---|---|
| `Id` | `Guid` | Primary key |
| `MeiId` | `Guid` | FK → `Mei` |
| `Name` | `string` | Employee full name |
| `ContractType` | `string?` | Employment contract type (e.g. CLT, PJ) |
| `Salary` | `decimal?` | Base salary |
| `Charges` | `decimal?` | Employer social charges |
| `CreatedAt` | `DateTime` | Record creation timestamp |
| `UpdatedAt` | `DateTime?` | Last update timestamp |

---

### `Product`
A product or service offered by a `Mei`.

| Property | Type | Description |
|---|---|---|
| `Id` | `Guid` | Primary key |
| `MeiId` | `Guid` | FK → `Mei` |
| `Name` | `string` | Product/service name |
| `Cost` | `decimal?` | Production or acquisition cost |
| `Price` | `decimal?` | Selling price |
| `DesiredMargin` | `decimal?` | Target profit margin (%) |
| `Status` | `string?` | Availability status (default: `active`) |
| `CreatedAt` | `DateTime` | Record creation timestamp |
| `UpdatedAt` | `DateTime?` | Last update timestamp |

---

### `Transaction`
A financial movement (income or expense) for a `Mei`. Can originate from a bulk `Import`.

| Property | Type | Description |
|---|---|---|
| `Id` | `Guid` | Primary key |
| `MeiId` | `Guid` | FK → `Mei` |
| `ImportId` | `Guid?` | FK → `Import` (nullable — set null on import deletion) |
| `Type` | `string` | Movement direction (e.g. `income`, `expense`) |
| `Category` | `string?` | Business category label |
| `Amount` | `decimal` | Transaction value |
| `Description` | `string?` | Free-text note |
| `Date` | `DateOnly` | Date of the transaction |
| `CreatedAt` | `DateTime` | Record creation timestamp |
| `UpdatedAt` | `DateTime?` | Last update timestamp |

---

### `Import`
A bulk file import job that creates multiple `Transaction` records from a file.

| Property | Type | Description |
|---|---|---|
| `Id` | `Guid` | Primary key |
| `MeiId` | `Guid` | FK → `Mei` |
| `FileUri` | `string` | Storage URI of the uploaded file |
| `Status` | `string` | Processing state (default: `pending`) |
| `TotalRows` | `int?` | Total rows detected in the file |
| `ProcessedRows` | `int?` | Rows successfully processed (default: `0`) |
| `Errors` | `string?` | JSON array of row-level errors |
| `CreatedAt` | `DateTime` | Record creation timestamp |
| `UpdatedAt` | `DateTime?` | Last update timestamp |

---

### `Document`
A document or file attached to a `Mei` (e.g. contracts, invoices, certificates).

| Property | Type | Description |
|---|---|---|
| `Id` | `Guid` | Primary key |
| `MeiId` | `Guid` | FK → `Mei` |
| `Title` | `string` | Document title |
| `Content` | `string` | Text content or extracted body |
| `FileUri` | `string?` | Storage URI of the associated file |
| `CreatedAt` | `DateTime` | Record creation timestamp |

---

### `AiRecommendation`
An AI-generated insight or recommendation produced for a `Mei`.

| Property | Type | Description |
|---|---|---|
| `Id` | `Guid` | Primary key |
| `MeiId` | `Guid` | FK → `Mei` |
| `Type` | `string` | Recommendation category (e.g. `financial`, `tax`) |
| `Content` | `string` | Human-readable recommendation text |
| `Metadata` | `string?` | JSONB payload with supporting data |
| `CreatedAt` | `DateTime` | Record creation timestamp |

---

## `Interfaces/` — Pending

This folder will hold repository contracts that `Core.Infrastructure` must implement, following the Dependency Inversion Principle. Example contracts to define:

```csharp
public interface IUserRepository { ... }
public interface IMeiRepository { ... }
public interface ITransactionRepository { ... }
// etc.
```

`Core.Application` will depend only on these interfaces — never on the concrete infrastructure implementations.

---

## Known Issues

- All entity files currently carry `namespace Core.Infrastructure` instead of `namespace Core.Domain`. This is a side effect of EF Core scaffolding and should be corrected so the namespace matches the project and folder.
