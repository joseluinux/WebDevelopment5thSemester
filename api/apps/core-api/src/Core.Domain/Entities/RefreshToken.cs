using System;

namespace Core.Infrastructure;

// Persisted refresh-token record.
//
// Lives server-side, indexed by the opaque token string the client holds. The
// row carries everything the auth flow needs to make decisions independently of
// any other entity:
//   - ExpiresAt tells us if the token is past its time-to-live.
//   - IsRevoked tells us if the token was explicitly invalidated (logout, or
//     replaced during rotation).
// Both fields are checked on every refresh — neither alone is sufficient.
public partial class RefreshToken
{
    public Guid Id { get; set; }

    // Foreign key to the user this token authenticates.
    public Guid UserId { get; set; }

    // The opaque token string that the client presents. Indexed (unique) so
    // lookups by token are O(log n) and duplicate tokens are impossible.
    public string Token { get; set; } = null!;

    // Absolute UTC instant after which this token is no longer accepted.
    public DateTime ExpiresAt { get; set; }

    // Soft-delete flag. We never physically delete refresh tokens because
    // keeping them allows audit trails ("when did this session end?") and
    // detection of attempts to reuse a revoked token (a classic theft signal).
    public bool IsRevoked { get; set; }

    public DateTime CreatedAt { get; set; }

    // Navigation property to the owning user. EF Core uses the UserId FK to
    // populate this when the query asks for it.
    public virtual User User { get; set; } = null!;
}
