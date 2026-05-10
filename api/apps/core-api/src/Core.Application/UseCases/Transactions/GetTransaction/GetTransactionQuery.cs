namespace Core.Application.UseCases.Transactions.GetTransaction;

// Input for "fetch one specific transaction".
//
// All three ids are needed:
//   - UserId (JWT)        : which user is asking
//   - MeiId  (URL)        : which MEI scopes the request
//   - TransactionId (URL) : which row inside that MEI
// The handler enforces both "user owns MEI" AND "transaction belongs to
// MEI" — see GetTransactionHandler for why both checks matter.
public record GetTransactionQuery(Guid MeiId, Guid UserId, Guid TransactionId);
