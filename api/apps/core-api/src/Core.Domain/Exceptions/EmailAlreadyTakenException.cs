namespace Core.Domain.Exceptions;

public class EmailAlreadyTakenException : Exception
{
    public EmailAlreadyTakenException(string email)
        : base($"Email '{email}' is already taken.") { }
}
