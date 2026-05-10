using Core.Domain.Exceptions;
using Core.Domain.Interfaces;

namespace Core.Application.UseCases.Employees.GetEmployees;

// Returns every employee in the given MEI, after verifying the caller owns
// it. Each row carries its calculated TotalCost — see GetEmployeesResult
// for the formula and rationale.
public class GetEmployeesHandler
{
    private readonly IEmployeeRepository _employeeRepository;
    private readonly IMeiRepository _meiRepository;

    public GetEmployeesHandler(
        IEmployeeRepository employeeRepository,
        IMeiRepository meiRepository)
    {
        _employeeRepository = employeeRepository;
        _meiRepository = meiRepository;
    }

    public async Task<IReadOnlyList<GetEmployeesResult>> HandleAsync(
        GetEmployeesQuery query,
        CancellationToken cancellationToken = default)
    {
        // Step 1 — Parent MEI ownership.
        var mei = await _meiRepository.GetByIdAsync(query.MeiId, cancellationToken);
        if (mei is null)
            throw new MeiNotFoundException(query.MeiId);
        if (mei.UserId != query.UserId)
            throw new UnauthorizedAccessException("You do not have access to this MEI.");

        // Step 2 — Read.
        var rows = await _employeeRepository.GetAllByMeiIdAsync(
            query.MeiId, cancellationToken);

        // Step 3 — Project, computing TotalCost = Salary + Charges. Both
        // inputs are nullable on legacy rows, so we treat null as 0 — the
        // alternative (returning a nullable TotalCost) would force every
        // client to repeat the same defaulting logic.
        return rows.Select(e => new GetEmployeesResult(
                e.Id,
                e.MeiId,
                e.Name,
                e.ContractType,
                e.Salary,
                e.Charges,
                e.CreatedAt,
                e.UpdatedAt,
                (e.Salary ?? 0m) + (e.Charges ?? 0m)))
            .ToList();
    }
}
