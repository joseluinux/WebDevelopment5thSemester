using Core.Domain.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace Core.Infrastructure.Persistence.Repositories;

// EF Core implementation of IRefreshTokenRepository.
// Mirrors the shape of UserRepository — single DbContext dependency, async
// methods, no business logic.
public class RefreshTokenRepository : IRefreshTokenRepository
{
    private readonly AppDbContext _context;

    public RefreshTokenRepository(AppDbContext context)
    {
        _context = context;
    }

    // Inserts the refresh token row and flushes immediately. We don't batch
    // with the user write because the use cases that create refresh tokens
    // (Login, Refresh) treat the row as required for the response — failing
    // fast on the insert is better than returning a token the DB does not
    // know about.
    public async Task AddAsync(RefreshToken refreshToken, CancellationToken cancellationToken = default)
    {
        await _context.RefreshTokens.AddAsync(refreshToken, cancellationToken);
        await _context.SaveChangesAsync(cancellationToken);
    }

    // Lookup by the opaque token string. The unique index defined in
    // OnModelCreating makes this an indexed seek.
    public async Task<RefreshToken?> GetByTokenAsync(string token, CancellationToken cancellationToken = default)
    {
        return await _context.RefreshTokens
            .FirstOrDefaultAsync(t => t.Token == token, cancellationToken);
    }

    // Soft-revoke: flip the flag and persist. We never DELETE rows because
    // keeping them lets us detect attempts to reuse a revoked token (a strong
    // signal of token theft) and lets ops reconstruct session timelines.
    public async Task RevokeAsync(RefreshToken refreshToken, CancellationToken cancellationToken = default)
    {
        refreshToken.IsRevoked = true;
        // The entity may already be tracked (loaded via GetByTokenAsync in the
        // same scope) — calling Update is idempotent in that case and also
        // covers callers that hand us a detached entity.
        _context.RefreshTokens.Update(refreshToken);
        await _context.SaveChangesAsync(cancellationToken);
    }
}
