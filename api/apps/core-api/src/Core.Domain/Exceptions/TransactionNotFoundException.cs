namespace Core.Domain.Exceptions;

// Domain exception thrown when a use case looks up a transaction by id and
// finds nothing — OR when the transaction exists but does not belong to the
// MEI in the URL (handlers throw this same exception for both cases, so an
// attacker probing for transaction ids cannot distinguish "doesn't exist"
// from "exists under a different MEI").
//
// As with MeiNotFoundException, ownership-violation cases (the parent MEI
// belongs to a different USER) are surfaced as UnauthorizedAccessException
// instead — the controller maps that to 403, distinct from this 404.
public class TransactionNotFoundException : Exception
{
    public TransactionNotFoundException(Guid id)
        : base($"Transaction with id '{id}' was not found.") { }
}
