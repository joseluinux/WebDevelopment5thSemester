using Core.Domain.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace Core.Infrastructure.Persistence.Repositories;

// EF Core implementation of IMeiRepository.
// Same shape as UserRepository / RefreshTokenRepository — single DbContext
// dependency, no business logic, no ownership filtering (that lives in the
// application layer).
public class MeiRepository : IMeiRepository
{
    private readonly AppDbContext _context;

    public MeiRepository(AppDbContext context)
    {
        _context = context;
    }

    // AsNoTracking on read-only listings: the entities returned here are
    // serialized to the wire and never mutated, so paying for change tracking
    // would be pure overhead.
    public async Task<IReadOnlyList<Mei>> GetAllByUserIdAsync(Guid userId, CancellationToken cancellationToken = default)
    {
        return await _context.Meis
            .AsNoTracking()
            .Where(m => m.UserId == userId)
            .ToListAsync(cancellationToken);
    }

    // FindAsync uses the change tracker before falling back to SQL — and we
    // want the entity tracked here, since callers (UpdateMei) typically mutate
    // the returned object and SaveChanges relies on tracking to detect changes.
    public async Task<Mei?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default)
    {
        return await _context.Meis.FindAsync(new object[] { id }, cancellationToken);
    }

    public async Task AddAsync(Mei mei, CancellationToken cancellationToken = default)
    {
        await _context.Meis.AddAsync(mei, cancellationToken);
        await _context.SaveChangesAsync(cancellationToken);
    }

    // Update is idempotent — if the entity is already tracked (loaded in this
    // scope) calling Update marks every property modified, and EF still emits
    // a single UPDATE. If the entity is detached, this is the call that
    // attaches it for the SaveChanges flush.
    public async Task UpdateAsync(Mei mei, CancellationToken cancellationToken = default)
    {
        _context.Meis.Update(mei);
        await _context.SaveChangesAsync(cancellationToken);
    }

    // Delete by id. We FIND the entity rather than attaching a fresh stub
    // because the use case (DeleteMeiHandler) has already loaded the row via
    // GetByIdAsync in the same DbContext scope for its ownership check —
    // attaching a second instance with the same key value would throw the
    // "another instance with the same key value is already being tracked"
    // exception. FindAsync consults the change tracker first, so the loaded
    // entity is reused at zero SQL cost. CASCADE FKs on child tables
    // (transactions, employees, etc., per AppDbContext) handle dependent rows.
    public async Task DeleteAsync(Guid id, CancellationToken cancellationToken = default)
    {
        var entity = await _context.Meis.FindAsync(new object[] { id }, cancellationToken);
        if (entity is null) return;
        _context.Meis.Remove(entity);
        await _context.SaveChangesAsync(cancellationToken);
    }
}
