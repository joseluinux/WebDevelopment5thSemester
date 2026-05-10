namespace Core.Domain.Exceptions;

// Thrown when a Create/Update product request carries a Status value other
// than "active" or "inactive". Same shape as InvalidTransactionTypeException
// — the canonical valid set lives on the exception so handlers can't drift.
public class InvalidProductStatusException : Exception
{
    public static readonly IReadOnlyList<string> ValidStatuses = new[] { "active", "inactive" };

    public InvalidProductStatusException(string? status)
        : base($"Invalid product status '{status}'. Allowed: {string.Join(", ", ValidStatuses)}.") { }
}
