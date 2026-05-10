namespace Core.Application.UseCases.Transactions.DeleteTransaction;

// Input for deleting one specific transaction.
public record DeleteTransactionCommand(Guid MeiId, Guid UserId, Guid TransactionId);
