using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using Core.Application.UseCases.Users.DeleteAccount;
using Core.Application.UseCases.Users.GetProfile;
using Core.Application.UseCases.Users.UpdateProfile;
using Core.Domain.Exceptions;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace CoreApi.Controllers;

// /me-style endpoints: every action operates on whichever user owns the JWT.
// [Authorize] applied at the class level means a missing/invalid token
// short-circuits with 401 before any action runs — we never have to check
// "is the caller authenticated?" inside an action.
[ApiController]
[Authorize]
[Route("v1/users")]
public class UsersController : ControllerBase
{
    private readonly GetProfileHandler _getProfileHandler;
    private readonly UpdateProfileHandler _updateProfileHandler;
    private readonly DeleteAccountHandler _deleteAccountHandler;

    public UsersController(
        GetProfileHandler getProfileHandler,
        UpdateProfileHandler updateProfileHandler,
        DeleteAccountHandler deleteAccountHandler)
    {
        _getProfileHandler = getProfileHandler;
        _updateProfileHandler = updateProfileHandler;
        _deleteAccountHandler = deleteAccountHandler;
    }

    // GET /v1/users/me — return the authenticated user's profile.
    [HttpGet("me")]
    public async Task<IActionResult> GetMe(CancellationToken cancellationToken)
    {
        if (!TryGetUserId(out var userId))
            return Unauthorized(new { error = "Invalid token subject." });

        try
        {
            var result = await _getProfileHandler.HandleAsync(new GetProfileQuery(userId), cancellationToken);
            return Ok(result);
        }
        catch (UserNotFoundException ex)
        {
            // 404 Not Found: token was valid, but the user no longer exists
            // (e.g. account was deleted after the token was issued).
            return NotFound(new { error = ex.Message });
        }
    }

    // PUT /v1/users/me — update the authenticated user's name and/or email.
    [HttpPut("me")]
    public async Task<IActionResult> UpdateMe(
        [FromBody] UpdateProfileDto dto,
        CancellationToken cancellationToken)
    {
        if (!TryGetUserId(out var userId))
            return Unauthorized(new { error = "Invalid token subject." });

        try
        {
            var command = new UpdateProfileCommand(userId, dto.Name, dto.Email);
            var result = await _updateProfileHandler.HandleAsync(command, cancellationToken);
            return Ok(result);
        }
        catch (UserNotFoundException ex)
        {
            return NotFound(new { error = ex.Message });
        }
        catch (EmailAlreadyTakenException ex)
        {
            // 409 Conflict: another user already owns the requested email.
            return Conflict(new { error = ex.Message });
        }
    }

    // DELETE /v1/users/me — permanently remove the authenticated user's
    // account. Dependent rows (refresh_tokens, meis, transactions, products,
    // employees, ...) are wiped via DB CASCADE — see DeleteAccountHandler.
    [HttpDelete("me")]
    public async Task<IActionResult> DeleteMe(CancellationToken cancellationToken)
    {
        if (!TryGetUserId(out var userId))
            return Unauthorized(new { error = "Invalid token subject." });

        try
        {
            await _deleteAccountHandler.HandleAsync(new DeleteAccountCommand(userId), cancellationToken);
            // 204 No Content: success with no body. Standard REST response
            // for a successful DELETE.
            return NoContent();
        }
        catch (UserNotFoundException ex)
        {
            return NotFound(new { error = ex.Message });
        }
    }

    // Reads the JWT subject claim and parses it as a Guid.
    //
    // Two claim names are checked:
    //   - ClaimTypes.NameIdentifier — what JwtSecurityTokenHandler maps "sub"
    //     to by default (DefaultMapInboundClaims = true).
    //   - JwtRegisteredClaimNames.Sub — the raw claim, in case inbound
    //     mapping is ever disabled.
    // Reading both protects this controller from a future config change to
    // the bearer pipeline silently breaking authentication.
    private bool TryGetUserId(out Guid userId)
    {
        var subjectClaim = User.FindFirstValue(ClaimTypes.NameIdentifier)
                           ?? User.FindFirstValue(JwtRegisteredClaimNames.Sub);
        return Guid.TryParse(subjectClaim, out userId);
    }
}

// Transport-layer DTO for PUT /v1/users/me.
//
// Note the absence of UserId: the body cannot dictate which user is being
// updated — that always comes from the JWT. Including a UserId field would
// invite confusion at best and a privilege-escalation bug at worst.
public record UpdateProfileDto(string? Name, string Email);
