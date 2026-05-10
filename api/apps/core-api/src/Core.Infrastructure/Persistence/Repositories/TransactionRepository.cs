using Core.Domain.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace Core.Infrastructure.Persistence.Repositories;

// EF Core implementation of ITransactionRepository.
public class TransactionRepository : ITransactionRepository
{
    private readonly AppDbContext _context;

    public TransactionRepository(AppDbContext context)
    {
        _context = context;
    }

    // Filtered listing.
    //
    // The optional filters are chained onto the IQueryable one at a time.
    // Each `if` only adds its predicate when the corresponding parameter
    // was supplied — null arguments mean "do not filter on this dimension"
    // and the predicate is simply skipped, leaving the SQL leaner.
    //
    // Order of `Where` calls does not affect correctness (every condition
    // becomes an AND in SQL), but the chain reads top-to-bottom and the
    // EF query translator coalesces them into a single WHERE clause.
    //
    // AsNoTracking is fine here — list responses are projected to a wire
    // DTO and never mutated, so paying for change tracking would be pure
    // overhead.
    public async Task<IReadOnlyList<Transaction>> GetAllByMeiIdAsync(
        Guid meiId,
        DateOnly? from,
        DateOnly? to,
        string? type,
        string? category,
        CancellationToken cancellationToken = default)
    {
        var query = _context.Transactions
            .AsNoTracking()
            .Where(t => t.MeiId == meiId);

        if (from is not null)
            query = query.Where(t => t.Date >= from.Value);

        if (to is not null)
            query = query.Where(t => t.Date <= to.Value);

        if (!string.IsNullOrWhiteSpace(type))
            query = query.Where(t => t.Type == type);

        if (!string.IsNullOrWhiteSpace(category))
            query = query.Where(t => t.Category == category);

        // Sort newest first, then by created order — predictable output even
        // when the filter window has many rows on the same date.
        return await query
            .OrderByDescending(t => t.Date)
            .ThenByDescending(t => t.CreatedAt)
            .ToListAsync(cancellationToken);
    }

    // FindAsync consults the change tracker first; UpdateTransactionHandler
    // mutates the returned entity, so we want it tracked.
    public async Task<Transaction?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default)
    {
        return await _context.Transactions.FindAsync(new object[] { id }, cancellationToken);
    }

    public async Task AddAsync(Transaction transaction, CancellationToken cancellationToken = default)
    {
        await _context.Transactions.AddAsync(transaction, cancellationToken);
        await _context.SaveChangesAsync(cancellationToken);
    }

    public async Task UpdateAsync(Transaction transaction, CancellationToken cancellationToken = default)
    {
        _context.Transactions.Update(transaction);
        await _context.SaveChangesAsync(cancellationToken);
    }

    // Delete by id. Same pattern as the User/Mei repositories — FIND first
    // so the entity-tracker conflict (a fresh stub vs the row already loaded
    // by the handler) is impossible.
    public async Task DeleteAsync(Guid id, CancellationToken cancellationToken = default)
    {
        var entity = await _context.Transactions.FindAsync(new object[] { id }, cancellationToken);
        if (entity is null) return;
        _context.Transactions.Remove(entity);
        await _context.SaveChangesAsync(cancellationToken);
    }
}
