using Core.Domain.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace Core.Infrastructure.Persistence.Repositories;

// EF Core implementation of IProductRepository.
public class ProductRepository : IProductRepository
{
    private readonly AppDbContext _context;

    public ProductRepository(AppDbContext context)
    {
        _context = context;
    }

    // Filtered listing.
    //
    // Like TransactionRepository.GetAllByMeiIdAsync, the optional `status`
    // filter is chained onto the IQueryable only when a value was supplied.
    // Null/empty status means "do not filter on this dimension" — the
    // predicate is skipped, leaving the SQL leaner.
    //
    // AsNoTracking on a read-only listing: the entities returned here are
    // projected to a wire DTO and never mutated, so paying for change
    // tracking would be pure overhead.
    public async Task<IReadOnlyList<Product>> GetAllByMeiIdAsync(
        Guid meiId,
        string? status,
        CancellationToken cancellationToken = default)
    {
        var query = _context.Products
            .AsNoTracking()
            .Where(p => p.MeiId == meiId);

        if (!string.IsNullOrWhiteSpace(status))
            query = query.Where(p => p.Status == status);

        // Newest first, then by name — predictable order even when many
        // products were created in the same instant.
        return await query
            .OrderByDescending(p => p.CreatedAt)
            .ThenBy(p => p.Name)
            .ToListAsync(cancellationToken);
    }

    // FindAsync hits the change tracker first; UpdateProductHandler mutates
    // the returned entity, so we want it tracked.
    public async Task<Product?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default)
    {
        return await _context.Products.FindAsync(new object[] { id }, cancellationToken);
    }

    public async Task AddAsync(Product product, CancellationToken cancellationToken = default)
    {
        await _context.Products.AddAsync(product, cancellationToken);
        await _context.SaveChangesAsync(cancellationToken);
    }

    public async Task UpdateAsync(Product product, CancellationToken cancellationToken = default)
    {
        _context.Products.Update(product);
        await _context.SaveChangesAsync(cancellationToken);
    }

    // Delete by id. Same FIND-then-Remove pattern as the other repositories
    // (User, Mei, Transaction) — attaching a stub on top of a row already
    // loaded by the handler in this scope would throw the "another instance
    // with the same key value is already being tracked" exception.
    public async Task DeleteAsync(Guid id, CancellationToken cancellationToken = default)
    {
        var entity = await _context.Products.FindAsync(new object[] { id }, cancellationToken);
        if (entity is null) return;
        _context.Products.Remove(entity);
        await _context.SaveChangesAsync(cancellationToken);
    }
}
