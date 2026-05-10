namespace Core.Application.UseCases.Transactions.UpdateTransaction;

// Input for editing an existing transaction. Same id-trio pattern as
// GetTransactionQuery (UserId from JWT, MeiId + TransactionId from URL).
public record UpdateTransactionCommand(
    Guid MeiId,
    Guid UserId,
    Guid TransactionId,
    string Type,
    string? Category,
    decimal Amount,
    DateOnly Date,
    string? Description);
