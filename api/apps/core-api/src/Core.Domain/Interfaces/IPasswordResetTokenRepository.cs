using Core.Infrastructure;

namespace Core.Domain.Interfaces;

// Repository contract for the PasswordResetToken aggregate.
//
// Narrow on purpose: forgot-password creates a row, reset-password reads
// it and marks it used. Nothing else needs to talk to this table.
public interface IPasswordResetTokenRepository
{
    Task AddAsync(PasswordResetToken token, CancellationToken cancellationToken = default);

    // Returns null when not found — "not found" is a normal outcome, not
    // an exception; the handler decides how to react (and treats it the
    // same as "expired" / "already used" to avoid leaking which case
    // matched).
    Task<PasswordResetToken?> GetByTokenAsync(string token, CancellationToken cancellationToken = default);

    // Soft-revoke: flip IsUsed and persist. We never DELETE rows — keeping
    // them lets us spot replay attempts (a strong signal that the link was
    // intercepted) and reconstruct an audit trail.
    Task MarkAsUsedAsync(Guid id, CancellationToken cancellationToken = default);
}
