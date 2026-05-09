namespace Core.Application.Auth;

// Plain POCO that mirrors the "JwtSettings" section of appsettings.json.
// Living in Core.Application lets both the handler (which signs tokens) and the
// CoreApi composition root (which configures JwtBearer validation) share the
// exact same type — no risk of issuer/audience drift between the two sides.
public class JwtSettings
{
    // Symmetric signing key. Must be a long, random string and is treated as a
    // secret — kept out of source control in real environments (env vars / secret
    // manager). HMAC-SHA256 requires at least 256 bits (32 bytes / 32 ASCII chars).
    public string Secret { get; set; } = string.Empty;

    // "iss" claim — identifies who issued the token (this API).
    public string Issuer { get; set; } = string.Empty;

    // "aud" claim — identifies the intended recipient of the token.
    public string Audience { get; set; } = string.Empty;

    // Access-token lifetime in minutes. Kept short (e.g. 15) so that a leaked
    // access token has limited blast radius; the refresh token is what extends
    // the session.
    public int AccessTokenExpirationMinutes { get; set; } = 15;
}
