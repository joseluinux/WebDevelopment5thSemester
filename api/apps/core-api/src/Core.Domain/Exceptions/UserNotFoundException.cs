namespace Core.Domain.Exceptions;

// Domain exception thrown when a use case demands an existing user but the
// repository returns null.
//
// Distinct from InvalidCredentialsException on purpose: the two failures live
// in different contexts. InvalidCredentialsException is anonymous (login flow)
// and must stay generic to avoid user enumeration. UserNotFoundException is
// raised from already-authenticated flows (e.g. GET /v1/auth/me when the JWT
// references a user that has been deleted), so leaking "the id you carry no
// longer exists" reveals nothing an attacker did not already know — they own
// the token.
public class UserNotFoundException : Exception
{
    public UserNotFoundException(Guid id)
        : base($"User with id '{id}' was not found.") { }
}
