namespace Core.Application.UseCases.Employees.GetEmployees;

// Wire-safe projection of one employee row.
//
// Why a dedicated DTO rather than serializing the entity directly:
// Employee has a `Mei` navigation, and Mei -> User -> PasswordHash. If we
// ever returned the entity straight to the wire, every employees response
// would risk leaking credentials. A narrow DTO makes that impossible.
//
// Calculated field:
//   TotalCost — the FULL monthly cost of keeping this person on payroll,
//               i.e. Salary + Charges. "Charges" here is the bucket where
//               employer-side burdens are stored (INSS patronal, FGTS,
//               vale-transporte, etc.). Knowing TotalCost is the whole
//               point of tracking employees in a MEI dashboard — it
//               drives the answer to "can I afford this hire?". Computed
//               here, never stored, so it can never drift from its inputs.
//
// Salary / Charges / ContractType are kept nullable to honestly reflect
// the entity (those Postgres columns allow NULL — legacy rows scaffolded
// from Supabase). TotalCost is non-nullable because the handler always
// supplies a sensible default (0) when both inputs are missing.
public record GetEmployeesResult(
    Guid Id,
    Guid MeiId,
    string Name,
    string? ContractType,
    decimal? Salary,
    decimal? Charges,
    DateTime CreatedAt,
    DateTime? UpdatedAt,
    decimal TotalCost);
