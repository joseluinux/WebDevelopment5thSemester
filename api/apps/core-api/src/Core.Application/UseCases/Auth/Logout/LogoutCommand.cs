namespace Core.Application.UseCases.Auth.Logout;

// Input for the logout use case. The client sends the refresh token they want
// to invalidate. The access token (still valid for its short remaining TTL)
// is unaffected — it will simply expire on its own. We don't track access
// tokens server-side, by design.
public record LogoutCommand(string Token);
