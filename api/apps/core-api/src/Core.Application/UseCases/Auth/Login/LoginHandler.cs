using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Security.Cryptography;
using System.Text;
using Core.Application.Auth;
using Core.Domain.Exceptions;
using Core.Domain.Interfaces;
using Core.Infrastructure;
using Microsoft.IdentityModel.Tokens;

namespace Core.Application.UseCases.Auth.Login;

// Handler for the Login use case.
//
// Depends only on abstractions:
//   - IUserRepository : data access (no EF leaks into the handler)
//   - JwtSettings     : pure POCO, easy to fake in tests
//
// This shape lets the handler be unit-tested without a database, without an HTTP
// pipeline, and without reading appsettings.json — Moq + a hand-built JwtSettings
// is enough.
public class LoginHandler
{
    private readonly IUserRepository _userRepository;
    private readonly JwtSettings _jwtSettings;

    public LoginHandler(IUserRepository userRepository, JwtSettings jwtSettings)
    {
        _userRepository = userRepository;
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

        // Step 3 — Generate the JWT access token.
        var expiresAt = DateTime.UtcNow.AddMinutes(_jwtSettings.AccessTokenExpirationMinutes);
        var accessToken = GenerateAccessToken(user, expiresAt);

        // Step 4 — Generate an opaque refresh token.
        // Persisting the refresh token is intentionally OUT OF SCOPE for this
        // vertical slice; rotation/revocation will be added in a follow-up slice.
        var refreshToken = GenerateRefreshToken();

        return new LoginResult(accessToken, refreshToken, expiresAt);
    }

    // Builds a signed JWT carrying the minimum claims a downstream handler needs
    // to identify the caller. We avoid stuffing PII (e.g. full name) into the
    // token — JWTs are base64-encoded, not encrypted, so anyone who sees the
    // token can read every claim.
    private string GenerateAccessToken(User user, DateTime expiresAt)
    {
        // The signing key is derived from the configured secret. HMAC-SHA256
        // requires a key of at least 256 bits; JwtSettings.Secret must be long
        // enough or token issuance will throw.
        var keyBytes = Encoding.UTF8.GetBytes(_jwtSettings.Secret);
        var signingCredentials = new SigningCredentials(
            new SymmetricSecurityKey(keyBytes),
            SecurityAlgorithms.HmacSha256);

        // Sub = subject = user id. Email is included for convenience, but the
        // user id is the canonical identifier used by authorization code.
        var claims = new[]
        {
            new Claim(JwtRegisteredClaimNames.Sub, user.Id.ToString()),
            new Claim(JwtRegisteredClaimNames.Email, user.Email),
            // jti = unique JWT id; useful for logging and future revocation lists.
            new Claim(JwtRegisteredClaimNames.Jti, Guid.NewGuid().ToString())
        };

        var token = new JwtSecurityToken(
            issuer: _jwtSettings.Issuer,
            audience: _jwtSettings.Audience,
            claims: claims,
            // notBefore left null = "valid immediately"; expires enforces the
            // short-lived nature of access tokens.
            expires: expiresAt,
            signingCredentials: signingCredentials);

        return new JwtSecurityTokenHandler().WriteToken(token);
    }

    // Refresh tokens are NOT JWTs — they are opaque high-entropy strings. Using
    // RandomNumberGenerator (a CSPRNG) instead of System.Random is critical:
    // System.Random is predictable and would let an attacker who has seen one
    // refresh token guess the next ones.
    //
    // 64 bytes -> 512 bits of entropy, base64-encoded for safe transport.
    private static string GenerateRefreshToken()
    {
        var bytes = new byte[64];
        RandomNumberGenerator.Fill(bytes);
        return Convert.ToBase64String(bytes);
    }
}
