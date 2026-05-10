namespace Core.Domain.Exceptions;

// Domain exception thrown when a Create/Update transaction request carries
// a Type value other than "income" or "expense".
//
// Why an exception instead of returning a Result<T> object: the rest of the
// codebase already uses domain exceptions for input-validation failures
// (EmailAlreadyTakenException, MeiNotFoundException, ...). Staying
// consistent keeps the controller's catch-and-map plumbing predictable.
public class InvalidTransactionTypeException : Exception
{
    // The valid set is also enforced here as the canonical reference — if
    // a future migration adds a third type, change THIS list and the rest
    // of the validation will follow.
    public static readonly IReadOnlyList<string> ValidTypes = new[] { "income", "expense" };

    public InvalidTransactionTypeException(string? type)
        : base($"Invalid transaction type '{type}'. Allowed: {string.Join(", ", ValidTypes)}.") { }
}
