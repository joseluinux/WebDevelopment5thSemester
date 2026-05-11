using System;

namespace Core.Infrastructure;

// Persisted single-use password-reset token.
//
// Same shape considerations as RefreshToken: lives server-side, indexed by
// the opaque token string the client carries, with both an expiry and a
// "used" flag that the handler checks on every claim.
public partial class PasswordResetToken
{
    public Guid Id { get; set; }

    // Foreign key to the user this token authorises a password change for.
    public Guid UserId { get; set; }

    // The opaque token string the user receives in their email. Indexed
    // (unique) so lookups by token are O(log n) and duplicate tokens are
    // impossible.
    public string Token { get; set; } = null!;

    // Absolute UTC instant after which this token is no longer accepted.
    // Fixed at issue time to 1 hour from "now" by the handler.
    public DateTime ExpiresAt { get; set; }

    // Single-use flag. Once a token has been redeemed (or revoked), we
    // never accept it again — even if it's still within its TTL. Keeping
    // the row instead of deleting it preserves the audit trail and lets
    // us detect reuse attempts (a strong signal that someone is replaying
    // an intercepted email).
    public bool IsUsed { get; set; }

    public DateTime CreatedAt { get; set; }

    // Navigation property to the owning user. EF Core populates it from
    // the UserId FK when queries ask for it.
    public virtual User User { get; set; } = null!;
}
