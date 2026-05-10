namespace Core.Domain.Exceptions;

// Domain exception thrown when a use case looks up a product by id and
// finds nothing — OR when the row exists but does not belong to the MEI in
// the URL. Same combined-cause exception as TransactionNotFoundException
// (cross-MEI probe resistance).
public class ProductNotFoundException : Exception
{
    public ProductNotFoundException(Guid id)
        : base($"Product with id '{id}' was not found.") { }
}
