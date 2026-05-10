using Core.Application.UseCases.Users.GetProfile;
using Core.Domain.Exceptions;
using Core.Domain.Interfaces;

namespace Core.Application.UseCases.Users.UpdateProfile;

// Handler for PUT /v1/users/me.
//
// Returns the updated profile (as GetProfileResult) so the caller can avoid
// a follow-up GET — standard REST courtesy for an "update + return new
// state" endpoint.
public class UpdateProfileHandler
{
    private readonly IUserRepository _userRepository;

    public UpdateProfileHandler(IUserRepository userRepository)
    {
        _userRepository = userRepository;
    }

    public async Task<GetProfileResult> HandleAsync(UpdateProfileCommand command, CancellationToken cancellationToken = default)
    {
        // Step 1 — Materialize the current user.
        var user = await _userRepository.GetByIdAsync(command.UserId, cancellationToken);
        if (user is null)
            throw new UserNotFoundException(command.UserId);

        // Step 2 — Email-uniqueness check.
        // We only hit the repository when the email is actually changing.
        // Skipping the no-change case avoids a useless DB round-trip AND
        // sidesteps a subtle edge case: GetByEmailAsync would return the
        // current user, and a naive "email taken" check would refuse a
        // perfectly valid no-op update.
        if (!string.Equals(user.Email, command.Email, StringComparison.OrdinalIgnoreCase))
        {
            var existing = await _userRepository.GetByEmailAsync(command.Email, cancellationToken);

            // Re-using EmailAlreadyTakenException keeps the wire response
            // consistent with /v1/auth/register. The Id check here is the
            // multi-tenant guard: only refuse when ANOTHER user already
            // owns the requested email — never refuse the caller their own
            // address (defence in depth, even though we already short-
            // circuited the no-change case above).
            if (existing is not null && existing.Id != user.Id)
                throw new EmailAlreadyTakenException(command.Email);
        }

        // Step 3 — Apply the editable fields. Id, PasswordHash, CreatedAt are
        // intentionally NOT touched — they are not part of the editable
        // surface (see UpdateProfileCommand).
        user.Name = command.Name;
        user.Email = command.Email;
        user.UpdatedAt = DateTime.UtcNow;

        await _userRepository.UpdateAsync(user, cancellationToken);

        return new GetProfileResult(user.Id, user.Name, user.Email, user.CreatedAt);
    }
}
