using Core.Domain.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace Core.Infrastructure.Persistence.Repositories;

// EF Core implementation of IImportRepository.
public class ImportRepository : IImportRepository
{
    private readonly AppDbContext _context;

    public ImportRepository(AppDbContext context)
    {
        _context = context;
    }

    // AsNoTracking on the listing — entities returned here are projected
    // to a wire DTO and never mutated, so paying for change tracking
    // would be pure overhead.
    public async Task<IReadOnlyList<Import>> GetAllByMeiIdAsync(
        Guid meiId,
        CancellationToken cancellationToken = default)
    {
        return await _context.Imports
            .AsNoTracking()
            .Where(i => i.MeiId == meiId)
            // Newest first — the Imports UI will almost always want the
            // most recent run at the top.
            .OrderByDescending(i => i.CreatedAt)
            .ToListAsync(cancellationToken);
    }

    // FindAsync hits the change tracker first. We want the row tracked
    // because CreateImportHandler mutates it (status / counters /
    // errors) and then calls UpdateAsync — having the same instance
    // cached avoids the "another instance with the same key value is
    // already being tracked" exception.
    public async Task<Import?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default)
    {
        return await _context.Imports.FindAsync(new object[] { id }, cancellationToken);
    }

    public async Task AddAsync(Import import, CancellationToken cancellationToken = default)
    {
        await _context.Imports.AddAsync(import, cancellationToken);
        await _context.SaveChangesAsync(cancellationToken);
    }

    // Update covers both already-tracked entities (typical in this
    // slice — the handler reads then mutates) and detached stubs.
    // EF will compute the column delta on SaveChanges.
    public async Task UpdateAsync(Import import, CancellationToken cancellationToken = default)
    {
        _context.Imports.Update(import);
        await _context.SaveChangesAsync(cancellationToken);
    }
}
