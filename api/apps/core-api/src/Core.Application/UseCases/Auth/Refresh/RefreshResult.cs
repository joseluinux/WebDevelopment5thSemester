namespace Core.Application.UseCases.Auth.Refresh;

// Output of the refresh use case.
//
// Same shape as LoginResult by design: from the client's perspective, "I just
// logged in" and "I just rotated my session" are interchangeable — the same
// fields are needed in both cases. RefreshToken is intentionally a NEW token
// (rotation), not an echo of the old one.
public record RefreshResult(string AccessToken, string RefreshToken, DateTime ExpiresAt);
