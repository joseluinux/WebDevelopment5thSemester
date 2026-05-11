using Core.Domain.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace Core.Infrastructure.Persistence.Repositories;

// EF Core implementation of IPasswordResetTokenRepository.
public class PasswordResetTokenRepository : IPasswordResetTokenRepository
{
    private readonly AppDbContext _context;

    public PasswordResetTokenRepository(AppDbContext context)
    {
        _context = context;
    }

    public async Task AddAsync(PasswordResetToken token, CancellationToken cancellationToken = default)
    {
        await _context.PasswordResetTokens.AddAsync(token, cancellationToken);
        await _context.SaveChangesAsync(cancellationToken);
    }

    // Lookup by the opaque token string. The unique index defined in
    // OnModelCreating makes this an indexed seek.
    public async Task<PasswordResetToken?> GetByTokenAsync(string token, CancellationToken cancellationToken = default)
    {
        return await _context.PasswordResetTokens
            .FirstOrDefaultAsync(t => t.Token == token, cancellationToken);
    }

    // Soft "consume" — flip IsUsed and persist. Same rationale as
    // refresh-token revocation: keeping the row lets us detect replay
    // attempts and reconstruct audit timelines.
    //
    // FIND first (rather than attaching a stub) because the handler may
    // already have the row loaded in this scope from GetByTokenAsync;
    // attaching a stub on top of a tracked entity would throw the
    // "another instance with the same key value is already being tracked"
    // exception we already learned about.
    public async Task MarkAsUsedAsync(Guid id, CancellationToken cancellationToken = default)
    {
        var entity = await _context.PasswordResetTokens.FindAsync(new object[] { id }, cancellationToken);
        if (entity is null) return;
        entity.IsUsed = true;
        await _context.SaveChangesAsync(cancellationToken);
    }
}
