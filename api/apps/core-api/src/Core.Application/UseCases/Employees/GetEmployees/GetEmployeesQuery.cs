namespace Core.Application.UseCases.Employees.GetEmployees;

// Input for "list every employee in a MEI".
//
// MeiId comes from the URL, UserId from the JWT — neither can be dictated
// by the body or by query-string.
public record GetEmployeesQuery(Guid MeiId, Guid UserId);
