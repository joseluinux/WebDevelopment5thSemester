using Core.Infrastructure;

namespace Core.Domain.Interfaces;

// Repository contract for the Product aggregate.
// Same shape conventions as ITransactionRepository: ownership lives in the
// application layer, the repository is dumb on purpose.
public interface IProductRepository
{
    // Returns products for one MEI, optionally filtered by Status
    // ("active"/"inactive"). Null/empty status means "do not filter".
    Task<IReadOnlyList<Product>> GetAllByMeiIdAsync(
        Guid meiId,
        string? status,
        CancellationToken cancellationToken = default);

    // Lookup by primary key. Null when the row does not exist — the caller
    // translates "missing" into the right exception AND verifies the
    // returned row's MeiId matches the URL's MEI before using it.
    Task<Product?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default);

    Task AddAsync(Product product, CancellationToken cancellationToken = default);

    Task UpdateAsync(Product product, CancellationToken cancellationToken = default);

    Task DeleteAsync(Guid id, CancellationToken cancellationToken = default);
}
