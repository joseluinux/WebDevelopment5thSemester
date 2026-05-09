using Core.Infrastructure;

namespace Core.Domain.Interfaces;

// This interface defines the data contract from the Domain layer's perspective.
// Living in Core.Domain (the innermost layer), it declares *what* operations exist
// without saying *how* they are implemented — keeping the domain free of any
// database or framework dependency.
public interface IUserRepository
{
    // The nullable return type (User?) explicitly communicates that "not found" is a
    // valid, expected outcome — not an exceptional case that should throw.
    Task<User?> GetByEmailAsync(string email, CancellationToken cancellationToken = default);

    // Lookup by primary key — used by authenticated endpoints that already know
    // *which* user (via the JWT subject claim) and just need to materialize them.
    // Same nullable contract as GetByEmailAsync: missing rows are not exceptional
    // at the repository level; the application layer decides how to react.
    Task<User?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default);

    Task AddAsync(User user, CancellationToken cancellationToken = default);
}
