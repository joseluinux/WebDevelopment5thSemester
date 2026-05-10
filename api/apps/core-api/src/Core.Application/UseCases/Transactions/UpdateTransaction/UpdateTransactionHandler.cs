using Core.Application.UseCases.Transactions;
using Core.Domain.Exceptions;
using Core.Domain.Interfaces;

namespace Core.Application.UseCases.Transactions.UpdateTransaction;

// Updates the editable fields of one transaction.
public class UpdateTransactionHandler
{
    private readonly ITransactionRepository _transactionRepository;
    private readonly IMeiRepository _meiRepository;

    public UpdateTransactionHandler(
        ITransactionRepository transactionRepository,
        IMeiRepository meiRepository)
    {
        _transactionRepository = transactionRepository;
        _meiRepository = meiRepository;
    }

    public async Task<TransactionResult> HandleAsync(
        UpdateTransactionCommand command,
        CancellationToken cancellationToken = default)
    {
        // Step 1 — Parent MEI ownership.
        var mei = await _meiRepository.GetByIdAsync(command.MeiId, cancellationToken);
        if (mei is null)
            throw new MeiNotFoundException(command.MeiId);
        if (mei.UserId != command.UserId)
            throw new UnauthorizedAccessException("You do not have access to this MEI.");

        // Step 2 — Type validation BEFORE mutating anything.
        if (!InvalidTransactionTypeException.ValidTypes.Contains(command.Type))
            throw new InvalidTransactionTypeException(command.Type);

        // Step 3 — Load and verify the transaction is in this MEI.
        var tx = await _transactionRepository.GetByIdAsync(command.TransactionId, cancellationToken);
        if (tx is null || tx.MeiId != command.MeiId)
            // Same exception for "doesn't exist" and "exists under another MEI"
            // — see GetTransactionHandler for the rationale (cross-MEI probe
            // resistance).
            throw new TransactionNotFoundException(command.TransactionId);

        // Step 4 — Apply only the editable fields. Id, MeiId, ImportId,
        // CreatedAt are intentionally NOT touched — they are not part of
        // the editable surface.
        tx.Type = command.Type;
        tx.Category = command.Category;
        tx.Amount = command.Amount;
        tx.Date = command.Date;
        tx.Description = command.Description;
        tx.UpdatedAt = DateTime.UtcNow;

        await _transactionRepository.UpdateAsync(tx, cancellationToken);

        return new TransactionResult(
            tx.Id, tx.MeiId, tx.Type, tx.Category, tx.Amount,
            tx.Date, tx.Description, tx.CreatedAt, tx.UpdatedAt);
    }
}
