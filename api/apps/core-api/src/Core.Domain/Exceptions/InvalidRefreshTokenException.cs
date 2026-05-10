namespace Core.Domain.Exceptions;

// Domain exception thrown when a refresh-token operation is rejected.
//
// Like InvalidCredentialsException, this is a single exception covering
// MULTIPLE underlying causes (token not found, expired, revoked). The reason
// is the same: an attacker holding a captured token must not be able to learn
// from our error responses whether the token used to be valid, whether it was
// revoked, or whether it simply expired — all three look identical from the
// outside.
public class InvalidRefreshTokenException : Exception
{
    public InvalidRefreshTokenException()
        : base("Invalid refresh token.") { }
}
