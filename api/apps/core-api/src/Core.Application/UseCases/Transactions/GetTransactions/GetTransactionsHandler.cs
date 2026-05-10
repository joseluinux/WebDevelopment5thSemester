using Core.Domain.Exceptions;
using Core.Domain.Interfaces;

namespace Core.Application.UseCases.Transactions.GetTransactions;

// Returns every transaction in the given MEI, after verifying the caller
// owns that MEI.
public class GetTransactionsHandler
{
    private readonly ITransactionRepository _transactionRepository;
    private readonly IMeiRepository _meiRepository;

    public GetTransactionsHandler(
        ITransactionRepository transactionRepository,
        IMeiRepository meiRepository)
    {
        _transactionRepository = transactionRepository;
        _meiRepository = meiRepository;
    }

    public async Task<IReadOnlyList<TransactionResult>> HandleAsync(
        GetTransactionsQuery query,
        CancellationToken cancellationToken = default)
    {
        // Step 1 — Look up the parent MEI.
        var mei = await _meiRepository.GetByIdAsync(query.MeiId, cancellationToken);
        if (mei is null)
            throw new MeiNotFoundException(query.MeiId);

        // Step 2 — Multi-tenant ownership check (SAME pattern as
        // GetMeiHandler/UpdateMeiHandler). Without this branch a request
        // could read another tenant's transactions just by guessing a MeiId.
        if (mei.UserId != query.UserId)
            throw new UnauthorizedAccessException("You do not have access to this MEI.");

        // Step 3 — Delegate the filtered read.
        var rows = await _transactionRepository.GetAllByMeiIdAsync(
            query.MeiId,
            query.From,
            query.To,
            query.Type,
            query.Category,
            cancellationToken);

        // Step 4 — Project to the wire-safe DTO. The handler — not the
        // controller — owns this projection so the entity never escapes the
        // application layer.
        return rows
            .Select(t => new TransactionResult(
                t.Id, t.MeiId, t.Type, t.Category, t.Amount,
                t.Date, t.Description, t.CreatedAt, t.UpdatedAt))
            .ToList();
    }
}
