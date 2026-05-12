using Core.Infrastructure;

namespace Core.Domain.Interfaces;

// Repository contract for the Import aggregate.
//
// Like the other repositories in this codebase, ownership ("user owns the
// parent MEI") is intentionally NOT enforced here — that check lives in
// the application layer where the JWT-derived user id and the
// IMeiRepository are both available. Keeping the check loud and visible
// at the use-case level makes data leaks easier to spot in review.
public interface IImportRepository
{
    // Returns every import row for the given MEI, newest first.
    // Used by GetImportsHandler.
    Task<IReadOnlyList<Import>> GetAllByMeiIdAsync(
        Guid meiId,
        CancellationToken cancellationToken = default);

    // Lookup by primary key. Null when the row does not exist — the caller
    // is responsible for translating "missing" into the right exception
    // AND for verifying that the returned row's MeiId matches the URL's
    // MEI before using it.
    Task<Import?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default);

    // Inserts a new Import and commits the change in a single round trip.
    Task AddAsync(Import import, CancellationToken cancellationToken = default);

    // Persists changes to an already-tracked Import row (status / counters
    // / errors). Marked Update so the call also works for stub entities
    // attached outside the change tracker — matches the convention of the
    // other repositories in this project.
    Task UpdateAsync(Import import, CancellationToken cancellationToken = default);
}
