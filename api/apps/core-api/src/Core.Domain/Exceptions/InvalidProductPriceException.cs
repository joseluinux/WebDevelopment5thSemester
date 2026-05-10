namespace Core.Domain.Exceptions;

// Thrown when a Create/Update product request carries a non-positive Price.
//
// Price <= 0 would also break margin calculation (division by zero or
// negative-margin nonsense), so this validation is both a business rule
// AND a defensive guard for downstream computations.
public class InvalidProductPriceException : Exception
{
    public InvalidProductPriceException(decimal price)
        : base($"Invalid product price '{price}'. Price must be greater than zero.") { }
}
