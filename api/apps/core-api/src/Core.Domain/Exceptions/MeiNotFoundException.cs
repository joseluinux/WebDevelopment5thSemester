namespace Core.Domain.Exceptions;

// Domain exception thrown when a use case looks up a MEI by id and finds
// nothing.
//
// IMPORTANT: this exception is ONLY thrown when a row truly does not exist.
// When a row exists but belongs to a DIFFERENT user, handlers throw
// UnauthorizedAccessException instead — never MeiNotFoundException. Returning
// "not found" for someone else's MEI would technically hide its existence
// (an information-disclosure mitigation), but our API surface treats the two
// cases distinctly: 404 for genuine misses, 403 for ownership violations.
// The trade-off is intentional — multi-tenant id collisions are rare with
// Guids, and 403 is a clearer signal during development.
public class MeiNotFoundException : Exception
{
    public MeiNotFoundException(Guid id)
        : base($"MEI with id '{id}' was not found.") { }
}
