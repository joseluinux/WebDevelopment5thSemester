using Core.Domain.Exceptions;
using Core.Domain.Interfaces;

namespace Core.Application.UseCases.Auth.Logout;

// Handler for explicit logout — invalidates the supplied refresh token so it
// can never be exchanged for a new access/refresh pair.
//
// We do NOT touch any other tokens belonging to the user. A user can be
// logged in on multiple devices simultaneously, each with its own refresh
// token, and logging out on one device must not log them out everywhere.
public class LogoutHandler
{
    private readonly IRefreshTokenRepository _refreshTokenRepository;

    public LogoutHandler(IRefreshTokenRepository refreshTokenRepository)
    {
        _refreshTokenRepository = refreshTokenRepository;
    }

    public async Task HandleAsync(LogoutCommand command, CancellationToken cancellationToken = default)
    {
        var existing = await _refreshTokenRepository.GetByTokenAsync(command.Token, cancellationToken);

        // Two failure modes -> same exception:
        //   - token not found  : either invented or already long gone
        //   - already revoked  : double-logout, possibly an attacker probing
        // Both are equally illegitimate from our perspective and must look
        // identical on the wire. (We do NOT check expiration here — revoking
        // an expired token is harmless and idempotent, so allow it through.)
        if (existing is null || existing.IsRevoked)
            throw new InvalidRefreshTokenException();

        // Soft revoke. The row stays in the table (audit + reuse-detection).
        await _refreshTokenRepository.RevokeAsync(existing, cancellationToken);
    }
}
