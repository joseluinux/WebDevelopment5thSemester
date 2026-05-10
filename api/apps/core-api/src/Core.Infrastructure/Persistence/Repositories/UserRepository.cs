using Core.Domain.Interfaces;
using Core.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;

namespace Core.Infrastructure.Persistence.Repositories;

// Concrete implementation of IUserRepository using Entity Framework Core.
// Lives in Core.Infrastructure — the outermost layer — so it can reference EF and the DbContext
// without polluting the Domain or Application layers with framework concerns.
public class UserRepository : IUserRepository
{
    private readonly AppDbContext _context;

    public UserRepository(AppDbContext context)
    {
        _context = context;
    }

    // FirstOrDefaultAsync returns null when no match is found, satisfying the nullable
    // contract defined in IUserRepository.
    public async Task<User?> GetByEmailAsync(string email, CancellationToken cancellationToken = default)
    {
        return await _context.Users
            .FirstOrDefaultAsync(u => u.Email == email, cancellationToken);
    }

    // FindAsync uses the primary key directly and consults EF's change tracker
    // first — if the entity is already loaded in this scope, no SQL is sent.
    // Returns null when the row does not exist (matches the interface contract).
    public async Task<User?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default)
    {
        return await _context.Users.FindAsync(new object[] { id }, cancellationToken);
    }

    // EF Core unit-of-work pattern: AddAsync stages the entity in memory,
    // SaveChangesAsync flushes it to the database in a single transaction.
    public async Task AddAsync(User user, CancellationToken cancellationToken = default)
    {
        await _context.Users.AddAsync(user, cancellationToken);
        await _context.SaveChangesAsync(cancellationToken);
    }

    // Update is idempotent — if the entity is already tracked (loaded in this
    // scope) Update marks every property modified, and EF still emits a
    // single UPDATE. If the entity is detached, this is the call that
    // attaches it for the SaveChanges flush.
    public async Task UpdateAsync(User user, CancellationToken cancellationToken = default)
    {
        _context.Users.Update(user);
        await _context.SaveChangesAsync(cancellationToken);
    }

    // Delete by id. We FIND the entity rather than attaching a fresh stub
    // because the use case (DeleteAccountHandler) loaded the row earlier in
    // the same DbContext scope — attaching a second instance with the same
    // key value would throw "another instance with the same key value is
    // already being tracked". FindAsync hits the change tracker first, so
    // the loaded entity is reused at zero SQL cost. Dependent rows
    // (refresh_tokens, meis, transactions, products, employees, ...) are
    // removed by ON DELETE CASCADE constraints on the FK side — see
    // AppDbContext for the relationships.
    public async Task DeleteAsync(Guid id, CancellationToken cancellationToken = default)
    {
        var entity = await _context.Users.FindAsync(new object[] { id }, cancellationToken);
        if (entity is null) return;
        _context.Users.Remove(entity);
        await _context.SaveChangesAsync(cancellationToken);
    }
}
