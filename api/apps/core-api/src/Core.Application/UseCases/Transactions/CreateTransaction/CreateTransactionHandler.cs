using Core.Domain.Exceptions;
using Core.Domain.Interfaces;
using Core.Infrastructure;

namespace Core.Application.UseCases.Transactions.CreateTransaction;

// Creates a new transaction inside an authenticated user's MEI.
public class CreateTransactionHandler
{
    private readonly ITransactionRepository _transactionRepository;
    private readonly IMeiRepository _meiRepository;

    public CreateTransactionHandler(
        ITransactionRepository transactionRepository,
        IMeiRepository meiRepository)
    {
        _transactionRepository = transactionRepository;
        _meiRepository = meiRepository;
    }

    public async Task<TransactionResult> HandleAsync(
        CreateTransactionCommand command,
        CancellationToken cancellationToken = default)
    {
        // Step 1 — Parent MEI must exist and belong to the caller.
        // Performing the ownership check BEFORE the type validation matters:
        // a malicious caller probing for valid MEI ids should never get a
        // helpful "your type is wrong" error against someone else's MEI.
        // 403 first, type complaint second.
        var mei = await _meiRepository.GetByIdAsync(command.MeiId, cancellationToken);
        if (mei is null)
            throw new MeiNotFoundException(command.MeiId);
        if (mei.UserId != command.UserId)
            throw new UnauthorizedAccessException("You do not have access to this MEI.");

        // Step 2 — Type validation. The canonical valid set lives on
        // InvalidTransactionTypeException so callers cannot drift.
        if (!InvalidTransactionTypeException.ValidTypes.Contains(command.Type))
            throw new InvalidTransactionTypeException(command.Type);

        // Step 3 — Build the entity. Id is generated client-side so we can
        // include it in the response without an extra DB round-trip.
        var transaction = new Transaction
        {
            Id = Guid.NewGuid(),
            MeiId = command.MeiId,
            Type = command.Type,
            Category = command.Category,
            Amount = command.Amount,
            Date = command.Date,
            Description = command.Description,
            CreatedAt = DateTime.UtcNow
        };

        await _transactionRepository.AddAsync(transaction, cancellationToken);

        return new TransactionResult(
            transaction.Id,
            transaction.MeiId,
            transaction.Type,
            transaction.Category,
            transaction.Amount,
            transaction.Date,
            transaction.Description,
            transaction.CreatedAt,
            transaction.UpdatedAt);
    }
}
