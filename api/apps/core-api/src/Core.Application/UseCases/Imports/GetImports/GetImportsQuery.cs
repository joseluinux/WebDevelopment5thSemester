namespace Core.Application.UseCases.Imports.GetImports;

// Input for "list every import in a MEI".
//
// MeiId comes from the URL, UserId from the JWT — neither can be
// dictated by the body or by query-string. Same shape convention as
// GetEmployeesQuery / GetTransactionsQuery.
public record GetImportsQuery(Guid MeiId, Guid UserId);
