using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using Core.Application.UseCases.Auth.ForgotPassword;
using Core.Application.UseCases.Auth.GetMe;
using Core.Application.UseCases.Auth.Login;
using Core.Application.UseCases.Auth.Logout;
using Core.Application.UseCases.Auth.Refresh;
using Core.Application.UseCases.Auth.Register;
using Core.Application.UseCases.Auth.ResetPassword;
using Core.Domain.Exceptions;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace CoreApi.Controllers;

// The controller's only responsibility is translation between HTTP and the application layer.
// It receives HTTP input, delegates to the handler, and maps outcomes back to HTTP status codes.
[ApiController]
[Route("v1/auth")]
public class AuthController : ControllerBase
{
    private readonly RegisterHandler _registerHandler;
    private readonly LoginHandler _loginHandler;
    private readonly GetMeHandler _getMeHandler;
    private readonly RefreshHandler _refreshHandler;
    private readonly LogoutHandler _logoutHandler;
    private readonly ForgotPasswordHandler _forgotPasswordHandler;
    private readonly ResetPasswordHandler _resetPasswordHandler;

    public AuthController(
        RegisterHandler registerHandler,
        LoginHandler loginHandler,
        GetMeHandler getMeHandler,
        RefreshHandler refreshHandler,
        LogoutHandler logoutHandler,
        ForgotPasswordHandler forgotPasswordHandler,
        ResetPasswordHandler resetPasswordHandler)
    {
        _registerHandler = registerHandler;
        _loginHandler = loginHandler;
        _getMeHandler = getMeHandler;
        _refreshHandler = refreshHandler;
        _logoutHandler = logoutHandler;
        _forgotPasswordHandler = forgotPasswordHandler;
        _resetPasswordHandler = resetPasswordHandler;
    }

    [HttpPost("register")]
    public async Task<IActionResult> Register([FromBody] RegisterDto dto, CancellationToken cancellationToken)
    {
        try
        {
            // Map the HTTP transport object (RegisterDto) to an application-layer command,
            // then delegate all business logic to the handler.
            var command = new RegisterCommand(dto.Name, dto.Email, dto.Password);
            await _registerHandler.HandleAsync(command, cancellationToken);
            // 201 Created: the resource was successfully created.
            return StatusCode(201);
        }
        catch (EmailAlreadyTakenException ex)
        {
            // 409 Conflict: the email is already in use — map the domain exception to HTTP.
            return Conflict(new { error = ex.Message });
        }
        // CancellationToken is propagated from the HTTP request lifecycle all the way to
        // the database query, enabling proper cancellation if the client disconnects.
    }

    // POST /v1/auth/login — exchanges email + password for an access/refresh-token pair.
    [HttpPost("login")]
    public async Task<IActionResult> Login([FromBody] LoginDto dto, CancellationToken cancellationToken)
    {
        try
        {
            // Translate the transport DTO into an application command. The controller is
            // intentionally thin — every authentication rule lives in LoginHandler.
            var command = new LoginCommand(dto.Email, dto.Password);
            var result = await _loginHandler.HandleAsync(command, cancellationToken);

            // 200 OK with the LoginResult body. The serialized response carries the
            // access token, the opaque refresh token, and the absolute expiration.
            return Ok(result);
        }
        catch (InvalidCredentialsException ex)
        {
            // 401 Unauthorized: the credentials did not match.
            // Security: we expose only the generic message that the domain exception
            // carries — never which field failed (see InvalidCredentialsException).
            return Unauthorized(new { error = ex.Message });
        }
    }

    // GET /v1/auth/me — returns the authenticated user's profile.
    //
    // [Authorize] enforces that a valid JWT must be present and pass JwtBearer
    // validation BEFORE this action runs. Without it, ASP.NET Core short-circuits
    // the pipeline with a 401 — we never see the request and never need to write
    // manual "is the caller authenticated?" plumbing.
    [Authorize]
    [HttpGet("me")]
    public async Task<IActionResult> GetMe(CancellationToken cancellationToken)
    {
        // Extract the user id from the validated JWT.
        //
        // Two claim names are checked:
        //   - ClaimTypes.NameIdentifier — what JwtSecurityTokenHandler maps "sub"
        //     to by default (DefaultMapInboundClaims = true).
        //   - JwtRegisteredClaimNames.Sub — the raw "sub" claim, in case inbound
        //     claim mapping has been disabled or the token uses non-standard names.
        // Reading both protects this code from a future config change to the
        // bearer pipeline silently breaking the endpoint.
        var subjectClaim = User.FindFirstValue(ClaimTypes.NameIdentifier)
                           ?? User.FindFirstValue(JwtRegisteredClaimNames.Sub);

        // A token that passed JwtBearer validation but carries no parseable
        // subject is malformed for our purposes. Treat it as unauthorized rather
        // than trusting any other claim — never fall back to email or arbitrary
        // identifiers, which could be tampered with at issuance time.
        if (!Guid.TryParse(subjectClaim, out var userId))
            return Unauthorized(new { error = "Invalid token subject." });

        try
        {
            var result = await _getMeHandler.HandleAsync(new GetMeQuery(userId), cancellationToken);
            return Ok(result);
        }
        catch (UserNotFoundException ex)
        {
            // 404 Not Found: the JWT was valid, but the underlying user no longer
            // exists (e.g. account was deleted after the token was minted).
            return NotFound(new { error = ex.Message });
        }
    }

    // POST /v1/auth/refresh — exchanges a still-valid refresh token for a NEW
    // access/refresh-token pair (rotation).
    //
    // Intentionally NOT decorated with [Authorize]: the access token has
    // probably already expired by the time the client calls /refresh, and the
    // refresh token IS the credential. Demanding [Authorize] here would defeat
    // the entire purpose of refresh tokens.
    [HttpPost("refresh")]
    public async Task<IActionResult> Refresh([FromBody] TokenDto dto, CancellationToken cancellationToken)
    {
        try
        {
            var result = await _refreshHandler.HandleAsync(new RefreshCommand(dto.Token), cancellationToken);
            return Ok(result);
        }
        catch (InvalidRefreshTokenException ex)
        {
            // 401 Unauthorized: refresh token unknown / expired / revoked.
            // Same generic message regardless of which sub-cause hit — see
            // InvalidRefreshTokenException for the security rationale.
            return Unauthorized(new { error = ex.Message });
        }
    }

    // POST /v1/auth/logout — invalidates the supplied refresh token.
    //
    // Protected with [Authorize] because the spec requires it: the caller must
    // present a valid access token in addition to the refresh token. This
    // raises the bar for an attacker (they need BOTH tokens to log a victim
    // out, not just a stolen refresh token).
    [Authorize]
    [HttpPost("logout")]
    public async Task<IActionResult> Logout([FromBody] TokenDto dto, CancellationToken cancellationToken)
    {
        try
        {
            await _logoutHandler.HandleAsync(new LogoutCommand(dto.Token), cancellationToken);
            // 200 OK with no body — the operation succeeded; nothing to return.
            return Ok();
        }
        catch (InvalidRefreshTokenException ex)
        {
            // 401 Unauthorized: the refresh token was unknown or already revoked.
            return Unauthorized(new { error = ex.Message });
        }
    }

    // POST /v1/auth/forgot-password — request a password-reset email.
    //
    // No [Authorize]: the caller cannot log in (that's the whole point).
    //
    // ALWAYS returns 200 OK, regardless of whether the email is registered.
    // This is a deliberate user-enumeration defence — returning a different
    // status for "unknown email" would let an attacker harvest valid user
    // emails by polling this endpoint. The handler itself silently returns
    // for missing users; we don't even catch any exception, since the
    // happy path here is "either we did the work, or we silently did
    // nothing". A real failure (DB down, email provider down) bubbles up
    // to the framework's 500 — that's fine, because it would tell the
    // attacker exactly nothing about email validity.
    [HttpPost("forgot-password")]
    public async Task<IActionResult> ForgotPassword(
        [FromBody] ForgotPasswordDto dto,
        CancellationToken cancellationToken)
    {
        await _forgotPasswordHandler.HandleAsync(
            new ForgotPasswordCommand(dto.Email),
            cancellationToken);
        return Ok();
    }

    // POST /v1/auth/reset-password — exchange a reset token for a new password.
    //
    // No [Authorize]: the user can't authenticate yet — the reset token IS
    // the credential.
    [HttpPost("reset-password")]
    public async Task<IActionResult> ResetPassword(
        [FromBody] ResetPasswordDto dto,
        CancellationToken cancellationToken)
    {
        try
        {
            await _resetPasswordHandler.HandleAsync(
                new ResetPasswordCommand(dto.Token, dto.NewPassword),
                cancellationToken);
            return Ok();
        }
        catch (InvalidResetTokenException ex)
        {
            // 400 Bad Request: the token is unknown, expired, or already used.
            // Same generic message regardless of sub-cause (see
            // InvalidResetTokenException for the rationale).
            return BadRequest(new { error = ex.Message });
        }
    }
}

// RegisterDto is a transport-layer object (JSON body shape) and belongs here in the
// presentation layer — not in the domain or application layers.
public record RegisterDto(string Name, string Email, string Password);

// LoginDto mirrors the JSON body of POST /v1/auth/login. Like RegisterDto, it lives
// in the presentation layer because its shape is dictated by the HTTP API, not by
// any domain concept.
public record LoginDto(string Email, string Password);

// Shared body shape for /refresh and /logout — both routes carry just the
// opaque refresh-token string. Kept as one DTO because the wire format is
// identical; if the routes diverge in the future, split them then.
public record TokenDto(string Token);

// JSON body of POST /v1/auth/forgot-password.
public record ForgotPasswordDto(string Email);

// JSON body of POST /v1/auth/reset-password.
public record ResetPasswordDto(string Token, string NewPassword);
