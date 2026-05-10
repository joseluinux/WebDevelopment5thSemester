namespace Core.Application.UseCases.Employees.CreateEmployee;

// Input for creating a new employee.
//
// MeiId comes from the URL, UserId from the JWT — neither can be dictated
// by the body. ContractType / Salary / Charges are required at the command
// level even though the entity columns allow null: forcing them on
// creation gives a complete row from day one and keeps TotalCost reports
// truthful.
public record CreateEmployeeCommand(
    Guid MeiId,
    Guid UserId,
    string Name,
    string ContractType,
    decimal Salary,
    decimal Charges);
