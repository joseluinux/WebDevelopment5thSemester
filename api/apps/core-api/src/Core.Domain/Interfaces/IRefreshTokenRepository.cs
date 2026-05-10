using Core.Infrastructure;

namespace Core.Domain.Interfaces;

// Repository contract for the RefreshToken aggregate.
//
// Exposes only the operations the auth use cases need — there is intentionally
// no GetByUserAsync, no DeleteAsync, etc. Adding methods here means more
// surface area to test and to secure, so we keep it minimal until a real use
// case demands more.
public interface IRefreshTokenRepository
{
    // Persist a freshly minted refresh token. Called by Login and by the
    // rotation step inside Refresh.
    Task AddAsync(RefreshToken refreshToken, CancellationToken cancellationToken = default);

    // Lookup by opaque token string. Returns null when not found — "not found"
    // is a normal outcome, not an exception, and the calling handler decides
    // how to react. Indexed lookup (see AppDbContext) keeps this O(log n).
    Task<RefreshToken?> GetByTokenAsync(string token, CancellationToken cancellationToken = default);

    // Mark the supplied token as revoked and persist the change. Soft delete
    // (we keep the row) so audit trails and reuse-detection remain possible.
    Task RevokeAsync(RefreshToken refreshToken, CancellationToken cancellationToken = default);
}
