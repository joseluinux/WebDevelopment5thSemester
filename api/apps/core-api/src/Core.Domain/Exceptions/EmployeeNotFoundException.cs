namespace Core.Domain.Exceptions;

// Domain exception thrown when a use case looks up an employee by id and
// finds nothing — OR when the row exists but does not belong to the MEI
// in the URL. Same combined-cause exception as ProductNotFoundException
// (cross-MEI probe resistance).
//
// Currently unused by this slice's two handlers (List + Create), but
// reserved so future per-employee endpoints (Get/Update/Delete) can
// reuse it without inventing yet another not-found type.
public class EmployeeNotFoundException : Exception
{
    public EmployeeNotFoundException(Guid id)
        : base($"Employee with id '{id}' was not found.") { }
}
