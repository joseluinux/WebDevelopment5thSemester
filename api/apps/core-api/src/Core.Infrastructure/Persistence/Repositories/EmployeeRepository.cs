using Core.Domain.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace Core.Infrastructure.Persistence.Repositories;

// EF Core implementation of IEmployeeRepository.
public class EmployeeRepository : IEmployeeRepository
{
    private readonly AppDbContext _context;

    public EmployeeRepository(AppDbContext context)
    {
        _context = context;
    }

    // AsNoTracking on the listing — entities returned here are projected to
    // a wire DTO and never mutated, so paying for change tracking would be
    // pure overhead.
    public async Task<IReadOnlyList<Employee>> GetAllByMeiIdAsync(
        Guid meiId,
        CancellationToken cancellationToken = default)
    {
        return await _context.Employees
            .AsNoTracking()
            .Where(e => e.MeiId == meiId)
            // Newest first, then alphabetical — predictable order in the UI.
            .OrderByDescending(e => e.CreatedAt)
            .ThenBy(e => e.Name)
            .ToListAsync(cancellationToken);
    }

    // FindAsync hits the change tracker first. Not used by this slice but
    // kept tracked-by-default so future Update handlers can mutate the
    // returned entity without an extra Attach call.
    public async Task<Employee?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default)
    {
        return await _context.Employees.FindAsync(new object[] { id }, cancellationToken);
    }

    public async Task AddAsync(Employee employee, CancellationToken cancellationToken = default)
    {
        await _context.Employees.AddAsync(employee, cancellationToken);
        await _context.SaveChangesAsync(cancellationToken);
    }
}
