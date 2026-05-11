namespace Core.Domain.Exceptions;

// Domain exception thrown when a /v1/auth/reset-password request carries a
// token that is either:
//   - unknown to the database (never issued, or fake),
//   - expired (older than 1 hour), or
//   - already used (single-use semantics).
//
// As with InvalidCredentialsException / InvalidRefreshTokenException, the
// SAME exception covers every failure mode. An attacker who captured an
// expired or already-redeemed token must not be able to distinguish "this
// link never existed" from "this link was already used" — both look
// identical on the wire, both prevent enumeration / reuse-confirmation
// attacks.
public class InvalidResetTokenException : Exception
{
    public InvalidResetTokenException()
        : base("Invalid or expired password reset token.") { }
}
