using Core.Infrastructure;

namespace Core.Domain.Interfaces;

// Repository contract for the Mei aggregate.
//
// Note: this interface intentionally does NOT enforce ownership. Filtering
// "user X owns MEI Y" is a use-case concern that belongs in the application
// layer, where the JWT-derived user id is available and where the right
// exceptions (UnauthorizedAccessException, MeiNotFoundException) can be
// thrown. A repository that hid rows by user id would tempt callers to skip
// the explicit ownership check, which makes leaks easier — better to keep the
// check loud and visible.
public interface IMeiRepository
{
    // Returns every MEI owned by the given user. Empty list if none.
    Task<IReadOnlyList<Mei>> GetAllByUserIdAsync(Guid userId, CancellationToken cancellationToken = default);

    // Lookup by primary key. Null when the row does not exist — the caller is
    // responsible for translating "missing" into the right exception AND for
    // verifying that the row's UserId matches the caller before using it.
    Task<Mei?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default);

    // Persist a brand-new MEI.
    Task AddAsync(Mei mei, CancellationToken cancellationToken = default);

    // Persist updates to an already-tracked or detached MEI.
    Task UpdateAsync(Mei mei, CancellationToken cancellationToken = default);

    // Hard delete by id. We delete the row directly (no soft delete) because
    // removing a MEI is an explicit user action and there is no audit
    // requirement equivalent to refresh-token reuse detection. If a soft
    // delete becomes necessary, change this contract first.
    Task DeleteAsync(Guid id, CancellationToken cancellationToken = default);
}
