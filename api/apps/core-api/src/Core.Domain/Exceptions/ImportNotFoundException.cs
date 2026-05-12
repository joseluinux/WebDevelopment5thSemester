namespace Core.Domain.Exceptions;

// Domain exception thrown when a use case looks up an import by id and
// finds nothing — OR when the row exists but does not belong to the MEI
// in the URL.
//
// Same combined-cause shape as ProductNotFoundException /
// EmployeeNotFoundException: returning a generic "not found" in both
// cases prevents a caller from probing the existence of imports owned
// by other tenants by trying random GUIDs.
public class ImportNotFoundException : Exception
{
    public ImportNotFoundException(Guid id)
        : base($"Import with id '{id}' was not found.") { }
}
