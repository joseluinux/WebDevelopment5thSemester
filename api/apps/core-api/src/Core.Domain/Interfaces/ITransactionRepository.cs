using Core.Infrastructure;

namespace Core.Domain.Interfaces;

// Repository contract for the Transaction aggregate.
//
// Like IMeiRepository, this interface intentionally does NOT enforce
// ownership. Filtering "user owns the parent MEI" is a use-case concern
// that lives in the application layer, where the JWT-derived user id and
// the IMeiRepository are both available. A repository that hid rows by
// user id would tempt callers to skip the explicit ownership check, which
// makes leaks easier to write — better to keep the check loud and visible.
public interface ITransactionRepository
{
    // Returns transactions for one MEI, optionally filtered by date range
    // (inclusive on both ends), type ("income"/"expense"), and category.
    // Any nullable parameter that comes in null means "do not filter on
    // this dimension".
    Task<IReadOnlyList<Transaction>> GetAllByMeiIdAsync(
        Guid meiId,
        DateOnly? from,
        DateOnly? to,
        string? type,
        string? category,
        CancellationToken cancellationToken = default);

    // Lookup by primary key. Null when the row does not exist — the caller
    // is responsible for translating "missing" into the right exception
    // AND for verifying that the row's MeiId matches the URL's MEI before
    // returning it.
    Task<Transaction?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default);

    Task AddAsync(Transaction transaction, CancellationToken cancellationToken = default);

    Task UpdateAsync(Transaction transaction, CancellationToken cancellationToken = default);

    Task DeleteAsync(Guid id, CancellationToken cancellationToken = default);
}
