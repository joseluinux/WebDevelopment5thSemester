using Core.Domain.Exceptions;
using Core.Domain.Interfaces;
using Core.Infrastructure;

namespace Core.Application.UseCases.Employees.CreateEmployee;

// Creates a new employee inside an authenticated user's MEI.
//
// Returns nothing (Task) — the controller maps success to 201 with no body.
// If a future requirement needs the created Id back on the wire, change
// this to Task<Guid> (or Task<GetEmployeesResult>) at that point.
public class CreateEmployeeHandler
{
    private readonly IEmployeeRepository _employeeRepository;
    private readonly IMeiRepository _meiRepository;

    public CreateEmployeeHandler(
        IEmployeeRepository employeeRepository,
        IMeiRepository meiRepository)
    {
        _employeeRepository = employeeRepository;
        _meiRepository = meiRepository;
    }

    public async Task HandleAsync(
        CreateEmployeeCommand command,
        CancellationToken cancellationToken = default)
    {
        // Step 1 — Parent MEI ownership.
        // Performed BEFORE input validation so a probe against someone
        // else's MEI gets 403, not a helpful "your contract type is wrong"
        // hint.
        var mei = await _meiRepository.GetByIdAsync(command.MeiId, cancellationToken);
        if (mei is null)
            throw new MeiNotFoundException(command.MeiId);
        if (mei.UserId != command.UserId)
            throw new UnauthorizedAccessException("You do not have access to this MEI.");

        // Step 2 — ContractType validation. Canonical valid set lives on
        // the exception class so handlers can't drift.
        if (!InvalidContractTypeException.ValidContractTypes.Contains(command.ContractType))
            throw new InvalidContractTypeException(command.ContractType);

        // Step 3 — Salary validation. Strictly positive: zero or negative
        // pay is either a UI bug or invalid data and would also produce a
        // misleading TotalCost downstream.
        if (command.Salary <= 0)
            throw new InvalidSalaryException(command.Salary);

        // Step 4 — Build and persist. Id is generated in the application
        // layer for symmetry with the other Create handlers.
        var employee = new Employee
        {
            Id = Guid.NewGuid(),
            MeiId = command.MeiId,
            Name = command.Name,
            ContractType = command.ContractType,
            Salary = command.Salary,
            Charges = command.Charges,
            CreatedAt = DateTime.UtcNow
        };

        await _employeeRepository.AddAsync(employee, cancellationToken);
    }
}
