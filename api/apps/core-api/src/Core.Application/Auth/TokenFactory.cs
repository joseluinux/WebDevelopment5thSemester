using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Security.Cryptography;
using System.Text;
using Core.Infrastructure;
using Microsoft.IdentityModel.Tokens;

namespace Core.Application.Auth;

// Internal helper that owns the cryptographic side of token issuance.
// Centralised so that Login and Refresh produce IDENTICAL tokens — every claim
// shape, every algorithm choice, every CSPRNG call lives in one place. Drift
// between the two flows (e.g. one forgetting "jti", or one switching to a weak
// random source) would be a security regression that's hard to spot in code
// review; centralising removes the temptation to diverge.
internal static class TokenFactory
{
    // Builds a signed JWT for `user`, valid until `expiresAt`.
    // PII is intentionally minimised — JWTs are base64-encoded, not encrypted,
    // so anyone who sees the token can read every claim.
    public static string CreateAccessToken(User user, DateTime expiresAt, JwtSettings settings)
    {
        // HMAC-SHA256 requires at least 256 bits of key material; the configured
        // Secret is responsible for being long enough.
        var keyBytes = Encoding.UTF8.GetBytes(settings.Secret);
        var signingCredentials = new SigningCredentials(
            new SymmetricSecurityKey(keyBytes),
            SecurityAlgorithms.HmacSha256);

        // Sub = subject = user id (canonical identifier used by [Authorize]).
        // Email is convenience; jti is a per-token unique id, useful for logs
        // and a future revocation list.
        var claims = new[]
        {
            new Claim(JwtRegisteredClaimNames.Sub, user.Id.ToString()),
            new Claim(JwtRegisteredClaimNames.Email, user.Email),
            new Claim(JwtRegisteredClaimNames.Jti, Guid.NewGuid().ToString())
        };

        var token = new JwtSecurityToken(
            issuer: settings.Issuer,
            audience: settings.Audience,
            claims: claims,
            // notBefore null = "valid immediately"; expires enforces the
            // short-lived access-token contract.
            expires: expiresAt,
            signingCredentials: signingCredentials);

        return new JwtSecurityTokenHandler().WriteToken(token);
    }

    // Generates an opaque high-entropy refresh token.
    //
    // RandomNumberGenerator (CSPRNG) is mandatory here. System.Random is
    // predictable from past output and would let an attacker who has seen one
    // refresh token guess the next ones — a catastrophic class of bug.
    //
    // 64 bytes -> 512 bits of entropy, base64-encoded for safe transport.
    public static string CreateRefreshToken()
    {
        var bytes = new byte[64];
        RandomNumberGenerator.Fill(bytes);
        return Convert.ToBase64String(bytes);
    }
}
