namespace Core.Application.UseCases.Ai.GetAiContext;

// Input for the "snapshot for the AI" endpoint.
//
// MeiId comes from the URL, UserId from the JWT — neither can be
// dictated by the body. Same shape convention as every other read
// query in this codebase (GetEmployeesQuery, GetTransactionsQuery).
public record GetAiContextQuery(Guid MeiId, Guid UserId);
