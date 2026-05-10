namespace Core.Application.UseCases.Transactions.CreateTransaction;

// Input for creating a new transaction.
//
// MeiId comes from the URL path, UserId from the JWT — neither can be
// dictated by the body. Date is DateOnly to match the entity column type
// (PostgreSQL `date`, not `timestamp`).
public record CreateTransactionCommand(
    Guid MeiId,
    Guid UserId,
    string Type,
    string? Category,
    decimal Amount,
    DateOnly Date,
    string? Description);
