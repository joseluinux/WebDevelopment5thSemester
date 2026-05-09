using Core.Domain.Interfaces;
using Core.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;

namespace Core.Infrastructure.Persistence.Repositories;

// Concrete implementation of IUserRepository using Entity Framework Core.
// Lives in Core.Infrastructure — the outermost layer — so it can reference EF and the DbContext
// without polluting the Domain or Application layers with framework concerns.
public class UserRepository : IUserRepository
{
    private readonly AppDbContext _context;

    public UserRepository(AppDbContext context)
    {
        _context = context;
    }

    // FirstOrDefaultAsync returns null when no match is found, satisfying the nullable
    // contract defined in IUserRepository.
    public async Task<User?> GetByEmailAsync(string email, CancellationToken cancellationToken = default)
    {
        return await _context.Users
            .FirstOrDefaultAsync(u => u.Email == email, cancellationToken);
    }

    // EF Core unit-of-work pattern: AddAsync stages the entity in memory,
    // SaveChangesAsync flushes it to the database in a single transaction.
    public async Task AddAsync(User user, CancellationToken cancellationToken = default)
    {
        await _context.Users.AddAsync(user, cancellationToken);
        await _context.SaveChangesAsync(cancellationToken);
    }
}
