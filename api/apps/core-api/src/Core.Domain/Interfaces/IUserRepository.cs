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
    Task AddAsync(User user, CancellationToken cancellationToken = default);
}
