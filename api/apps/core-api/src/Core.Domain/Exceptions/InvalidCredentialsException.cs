namespace Core.Domain.Exceptions;

// Domain exception representing any failed login attempt.
//
// Important security decision: we use a SINGLE exception type for every authentication
// failure (email not found OR wrong password). The two cases are never distinguished
// to the caller. This prevents user-enumeration attacks, in which an attacker could
// learn which emails exist in the database simply by observing different error
// messages.
//
// The message is intentionally generic ("Invalid credentials") — any extra detail
// would leak information that could help an attacker.
public class InvalidCredentialsException : Exception
{
    // Fixed message: never include the email, the offending field, or any hint of
    // what specifically failed.
    public InvalidCredentialsException()
        : base("Invalid credentials.") { }
}
