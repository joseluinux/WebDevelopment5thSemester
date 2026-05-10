using Core.Domain.Exceptions;
using Core.Domain.Interfaces;

namespace Core.Application.UseCases.Auth.GetMe;

// Handler for "tell me who the current authenticated user is".
//
// Depends only on IUserRepository — no HTTP, no JWT library, no DbContext.
// The caller (controller) is responsible for proving identity via [Authorize]
// and extracting the user id from the JWT subject claim before invoking this
// handler. From the application layer's perspective, the id is already trusted.
public class GetMeHandler
{
    private readonly IUserRepository _userRepository;

    public GetMeHandler(IUserRepository userRepository)
    {
        _userRepository = userRepository;
    }

    public async Task<GetMeResult> HandleAsync(GetMeQuery query, CancellationToken cancellationToken = default)
    {
        // Materialize the user behind the JWT subject claim.
        var user = await _userRepository.GetByIdAsync(query.UserId, cancellationToken);

        // A valid token can still reference a now-deleted user (account removed
        // after the token was issued). Surface that as a domain exception so the
        // controller can map it to the right HTTP status.
        if (user is null)
            throw new UserNotFoundException(query.UserId);

        // Project to the safe DTO. Note PasswordHash is intentionally NOT mapped
        // here — see GetMeResult for the security rationale.
        return new GetMeResult(user.Id, user.Name, user.Email, user.CreatedAt);
    }
}
