using Core.Domain.Exceptions;
using Core.Domain.Interfaces;

namespace Core.Application.UseCases.Transactions.GetTransaction;

// Returns one specific transaction, scoped to the given MEI, after every
// security check has cleared.
public class GetTransactionHandler
{
    private readonly ITransactionRepository _transactionRepository;
    private readonly IMeiRepository _meiRepository;

    public GetTransactionHandler(
        ITransactionRepository transactionRepository,
        IMeiRepository meiRepository)
    {
        _transactionRepository = transactionRepository;
        _meiRepository = meiRepository;
    }

    public async Task<TransactionResult> HandleAsync(
        GetTransactionQuery query,
        CancellationToken cancellationToken = default)
    {
        // Step 1 — Parent MEI must exist and belong to the caller.
        var mei = await _meiRepository.GetByIdAsync(query.MeiId, cancellationToken);
        if (mei is null)
            throw new MeiNotFoundException(query.MeiId);
        if (mei.UserId != query.UserId)
            throw new UnauthorizedAccessException("You do not have access to this MEI.");

        // Step 2 — Look up the transaction by id.
        var tx = await _transactionRepository.GetByIdAsync(query.TransactionId, cancellationToken);
        if (tx is null)
            throw new TransactionNotFoundException(query.TransactionId);

        // Step 3 — Cross-MEI guard.
        // The transaction id is well-formed and exists, but it might live
        // under a DIFFERENT MEI (one the caller may or may not own). We
        // refuse with TransactionNotFoundException — the SAME exception
        // used for "id never existed" — so an attacker who is fishing for
        // valid transaction ids cannot tell "exists under another MEI"
        // apart from "does not exist at all".
        if (tx.MeiId != query.MeiId)
            throw new TransactionNotFoundException(query.TransactionId);

        return new TransactionResult(
            tx.Id, tx.MeiId, tx.Type, tx.Category, tx.Amount,
            tx.Date, tx.Description, tx.CreatedAt, tx.UpdatedAt);
    }
}
