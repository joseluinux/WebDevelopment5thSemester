using Core.Infrastructure;

namespace Core.Domain.Interfaces;

// Repository contract for the Employee aggregate.
//
// This slice intentionally exposes a smaller surface than the previous
// CRUD repositories — only "list" and "create", plus a generic GetById
// for any future per-employee endpoint to build on. Update/Delete will
// be added when their use cases land; we don't ship interface methods
// nobody calls yet.
public interface IEmployeeRepository
{
    Task<IReadOnlyList<Employee>> GetAllByMeiIdAsync(
        Guid meiId,
        CancellationToken cancellationToken = default);

    // Lookup by primary key. Null when the row does not exist — callers
    // translate "missing" into the right exception AND verify the row's
    // MeiId matches the URL's MEI before using it. Not used by either of
    // this slice's two handlers, but kept on the interface so future
    // per-employee endpoints don't have to expand the contract.
    Task<Employee?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default);

    Task AddAsync(Employee employee, CancellationToken cancellationToken = default);
}
