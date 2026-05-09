using Core.Application.Auth;
using Core.Domain.Exceptions;
using Core.Domain.Interfaces;
using Core.Infrastructure;

namespace Core.Application.UseCases.Auth.Refresh;

// Handler for the refresh-token rotation use case.
//
// Flow:
//   1. Look up the supplied token. If it doesn't exist, is expired, or is
//      revoked -> throw InvalidRefreshTokenException (a SINGLE exception for
//      every failure mode, by design — see InvalidRefreshTokenException).
//   2. Materialize the user behind the token.
//   3. Mint a brand-new access token and a brand-new refresh token.
//   4. Revoke the old refresh token (rotation: each refresh token can be used
//      at most once).
//   5. Persist the new refresh token.
//
// Rotation is the most important invariant: it transforms refresh-token theft
// from "indefinite session takeover" to "race against the legitimate user". If
// the attacker rotates first, the legitimate user's next refresh fails (the
// old token is now revoked) — which is detectable. Without rotation, both
// parties can keep refreshing forever.
public class RefreshHandler
{
    private readonly IRefreshTokenRepository _refreshTokenRepository;
    private readonly IUserRepository _userRepository;
    private readonly JwtSettings _jwtSettings;

    public RefreshHandler(
        IRefreshTokenRepository refreshTokenRepository,
        IUserRepository userRepository,
        JwtSettings jwtSettings)
    {
        _refreshTokenRepository = refreshTokenRepository;
        _userRepository = userRepository;
        _jwtSettings = jwtSettings;
    }

    public async Task<RefreshResult> HandleAsync(RefreshCommand command, CancellationToken cancellationToken = default)
    {
        // Step 1 — Validate the supplied token.
        var existing = await _refreshTokenRepository.GetByTokenAsync(command.Token, cancellationToken);

        // Three failure modes, all surfaced as the same exception so an
        // attacker cannot distinguish "never existed" from "was revoked" from
        // "expired naturally". The order of these checks does not matter for
        // correctness, but combining them into one branch reinforces that
        // they're all equivalent from the caller's perspective.
        if (existing is null || existing.IsRevoked || existing.ExpiresAt <= DateTime.UtcNow)
            throw new InvalidRefreshTokenException();

        // Step 2 — Load the owning user. The token row carries UserId, so we
        // use that directly rather than trusting any data from the request.
        var user = await _userRepository.GetByIdAsync(existing.UserId, cancellationToken);
        // Defensive: if the user has been deleted but the token row still
        // exists (edge case, e.g. cascade misconfigured upstream), treat the
        // token as invalid — never issue a new session for a missing user.
        if (user is null)
            throw new InvalidRefreshTokenException();

        // Step 3 — Mint the new pair.
        var accessExpiresAt = DateTime.UtcNow.AddMinutes(_jwtSettings.AccessTokenExpirationMinutes);
        var newAccessToken = TokenFactory.CreateAccessToken(user, accessExpiresAt, _jwtSettings);
        var newRefreshTokenString = TokenFactory.CreateRefreshToken();

        // Step 4 — Revoke the OLD token first.
        // Order matters: if persisting the new token were to fail after we
        // already revoked the old one, the user is forced to re-authenticate
        // (annoying, but safe). The opposite ordering — persist new, then
        // revoke old — would leave a window where two valid refresh tokens
        // exist for one session, defeating rotation.
        await _refreshTokenRepository.RevokeAsync(existing, cancellationToken);

        // Step 5 — Persist the new refresh token.
        var newEntity = new RefreshToken
        {
            Id = Guid.NewGuid(),
            UserId = user.Id,
            Token = newRefreshTokenString,
            ExpiresAt = DateTime.UtcNow.AddDays(_jwtSettings.RefreshTokenExpirationDays),
            IsRevoked = false,
            CreatedAt = DateTime.UtcNow
        };
        await _refreshTokenRepository.AddAsync(newEntity, cancellationToken);

        return new RefreshResult(newAccessToken, newRefreshTokenString, accessExpiresAt);
    }
}
