using Core.Domain.Exceptions;
using Core.Domain.Interfaces;

namespace Core.Application.UseCases.Users.DeleteAccount;

// Handler for DELETE /v1/users/me — permanently removes the authenticated
// user's account.
//
// CASCADE STRATEGY (intentional and important):
// The handler deletes ONLY the User row. Every dependent record is removed
// by ON DELETE CASCADE constraints declared in the database schema:
//
//   users -> refresh_tokens   (CASCADE; we set this explicitly in
//                              AppDbContext for the refresh_tokens FK)
//   users -> meis             (CASCADE)
//     meis -> transactions    (CASCADE)
//     meis -> products        (CASCADE)
//     meis -> employees       (CASCADE)
//     meis -> documents       (CASCADE)
//     meis -> imports         (CASCADE)
//     meis -> ai_recommendations (CASCADE)
//
// Why we don't delete the children manually in code:
//   1. The DB is the source of truth for referential integrity. If a future
//      schema change adds a new child table, application-side cleanup would
//      silently miss it; CASCADE wouldn't.
//   2. A single DELETE on `users` issues one transactional cascade in the
//      DB — atomic by construction. App-side deletes would need an explicit
//      transaction wrapper to match that guarantee.
//   3. Less code to maintain, less test surface.
//
// If a CASCADE is missing in production, this DELETE will fail with a
// foreign-key violation (23503) — fix the schema, not this code.
public class DeleteAccountHandler
{
    private readonly IUserRepository _userRepository;

    public DeleteAccountHandler(IUserRepository userRepository)
    {
        _userRepository = userRepository;
    }

    public async Task HandleAsync(DeleteAccountCommand command, CancellationToken cancellationToken = default)
    {
        // Existence check before issuing the delete.
        // Without this branch a malformed/stale JWT could trigger a no-op
        // DELETE that returns 204 even though nothing happened — confusing
        // for the client. UserNotFoundException maps to 404 in the
        // controller, which is the truthful response.
        var user = await _userRepository.GetByIdAsync(command.UserId, cancellationToken);
        if (user is null)
            throw new UserNotFoundException(command.UserId);

        await _userRepository.DeleteAsync(user.Id, cancellationToken);
    }
}
