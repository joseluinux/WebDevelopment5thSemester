using Core.Domain.Exceptions;
using Core.Domain.Interfaces;

namespace Core.Application.UseCases.Transactions.DeleteTransaction;

// Hard-deletes one transaction, after every security check has cleared.
public class DeleteTransactionHandler
{
    private readonly ITransactionRepository _transactionRepository;
    private readonly IMeiRepository _meiRepository;

    public DeleteTransactionHandler(
        ITransactionRepository transactionRepository,
        IMeiRepository meiRepository)
    {
        _transactionRepository = transactionRepository;
        _meiRepository = meiRepository;
    }

    public async Task HandleAsync(
        DeleteTransactionCommand command,
        CancellationToken cancellationToken = default)
    {
        // Step 1 — Parent MEI ownership.
        var mei = await _meiRepository.GetByIdAsync(command.MeiId, cancellationToken);
        if (mei is null)
            throw new MeiNotFoundException(command.MeiId);
        if (mei.UserId != command.UserId)
            throw new UnauthorizedAccessException("You do not have access to this MEI.");

        // Step 2 — Transaction existence + cross-MEI guard.
        var tx = await _transactionRepository.GetByIdAsync(command.TransactionId, cancellationToken);
        if (tx is null || tx.MeiId != command.MeiId)
            throw new TransactionNotFoundException(command.TransactionId);

        // Step 3 — Delete. The repository's DeleteAsync uses FindAsync
        // internally, so the entity already loaded above is reused without
        // hitting the DB again.
        await _transactionRepository.DeleteAsync(tx.Id, cancellationToken);
    }
}
