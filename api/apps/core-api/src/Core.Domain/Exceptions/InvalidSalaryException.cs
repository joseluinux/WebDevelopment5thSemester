namespace Core.Domain.Exceptions;

// Thrown when a Create/Update employee request carries a non-positive
// salary.
//
// Salary <= 0 makes no business sense for a CLT/PJ/intern arrangement
// (zero or negative pay would either be a UI bug or an attempt to slip
// invalid data past validation). Rejecting it at the application layer
// keeps the row truthful AND keeps downstream calculations (TotalCost,
// monthly aggregates) free of surprising zeros.
public class InvalidSalaryException : Exception
{
    public InvalidSalaryException(decimal salary)
        : base($"Invalid salary '{salary}'. Salary must be greater than zero.") { }
}
