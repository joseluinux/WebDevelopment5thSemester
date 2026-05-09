using Core.Application.Auth;
using Core.Domain.Exceptions;
using Core.Domain.Interfaces;
using Core.Infrastructure;

namespace Core.Application.UseCases.Auth.Login;

// Handler for the Login use case.
//
// Depends only on abstractions:
//   - IUserRepository         : user lookup, no EF in the handler.
//   - IRefreshTokenRepository : persists the freshly minted refresh token so
//                               POST /v1/auth/refresh can later validate it.
//   - JwtSettings             : pure POCO, easy to fake in tests.
//
// All cryptographic decisions (claims, signing algorithm, CSPRNG choice) are
// delegated to TokenFactory — see Core.Application/Auth/TokenFactory.cs for
// the rationale.
public class LoginHandler
{
    private readonly IUserRepository _userRepository;
    private readonly IRefreshTokenRepository _refreshTokenRepository;
    private readonly JwtSettings _jwtSettings;

    public LoginHandler(
        IUserRepository userRepository,
        IRefreshTokenRepository refreshTokenRepository,
        JwtSettings jwtSettings)
    {
        _userRepository = userRepository;
        _refreshTokenRepository = refreshTokenRepository;
        _jwtSettings = jwtSettings;
    }

    public async Task<LoginResult> HandleAsync(LoginCommand command, CancellationToken cancellationToken = default)
    {
        // Step 1 — Look up the user by email.
        // Security note: we deliberately do NOT short-circuit with a different
        // error here. If the user is missing we still throw the SAME generic
        // InvalidCredentialsException as the wrong-password branch below, so an
        // attacker cannot tell whether the email exists in our database.
        var user = await _userRepository.GetByEmailAsync(command.Email, cancellationToken);
        if (user is null)
            throw new InvalidCredentialsException();

        // Step 2 — Verify the password against the stored BCrypt hash.
        // BCrypt.Verify performs a constant-time comparison internally and
        // re-derives the hash with the salt embedded in the stored value.
        // Same exception as Step 1: never leak which field was wrong.
        if (!BCrypt.Net.BCrypt.Verify(command.Password, user.PasswordHash))
            throw new InvalidCredentialsException();

        // Step 3 — Mint the access token.
        var accessExpiresAt = DateTime.UtcNow.AddMinutes(_jwtSettings.AccessTokenExpirationMinutes);
        var accessToken = TokenFactory.CreateAccessToken(user, accessExpiresAt, _jwtSettings);

        // Step 4 — Mint and persist the refresh token.
        // We persist BEFORE returning so that the moment the client receives
        // the token, it is already a valid row in the database. A token the
        // server hands out but cannot find later would be indistinguishable
        // from a forged one — and would lock the user out of refresh.
        var refreshTokenString = TokenFactory.CreateRefreshToken();
        var refreshTokenEntity = new RefreshToken
        {
            Id = Guid.NewGuid(),
            UserId = user.Id,
            Token = refreshTokenString,
            ExpiresAt = DateTime.UtcNow.AddDays(_jwtSettings.RefreshTokenExpirationDays),
            IsRevoked = false,
            CreatedAt = DateTime.UtcNow
        };
        await _refreshTokenRepository.AddAsync(refreshTokenEntity, cancellationToken);

        return new LoginResult(accessToken, refreshTokenString, accessExpiresAt);
    }
}
