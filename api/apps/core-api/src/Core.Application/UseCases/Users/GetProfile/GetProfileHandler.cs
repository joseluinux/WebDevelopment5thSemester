using Core.Domain.Exceptions;
using Core.Domain.Interfaces;

namespace Core.Application.UseCases.Users.GetProfile;

// Handler for GET /v1/users/me.
//
// Functionally identical to GetMeHandler (the legacy /v1/auth/me endpoint),
// kept separate for symmetry with the Users vertical slices (UpdateProfile,
// DeleteAccount). Either endpoint can be removed in the future without
// touching the other.
public class GetProfileHandler
{
    private readonly IUserRepository _userRepository;

    public GetProfileHandler(IUserRepository userRepository)
    {
        _userRepository = userRepository;
    }

    public async Task<GetProfileResult> HandleAsync(GetProfileQuery query, CancellationToken cancellationToken = default)
    {
        var user = await _userRepository.GetByIdAsync(query.UserId, cancellationToken);

        // A valid JWT can still reference a now-deleted user (account
        // removed after the token was issued). Surface that as a domain
        // exception so the controller can map it to the right HTTP status.
        if (user is null)
            throw new UserNotFoundException(query.UserId);

        // Project to the safe DTO. PasswordHash is intentionally NOT mapped —
        // see GetProfileResult for the security rationale.
        return new GetProfileResult(user.Id, user.Name, user.Email, user.CreatedAt);
    }
}
