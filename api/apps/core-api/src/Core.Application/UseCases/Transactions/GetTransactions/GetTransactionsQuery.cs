namespace Core.Application.UseCases.Transactions.GetTransactions;

// Input for "list every transaction in a MEI", optionally filtered.
//
// MeiId comes from the URL path, UserId from the JWT, and the four filters
// from query-string params. Any null filter means "do not filter on this
// dimension" — the repository understands that contract.
public record GetTransactionsQuery(
    Guid MeiId,
    Guid UserId,
    DateOnly? From,
    DateOnly? To,
    string? Type,
    string? Category);
