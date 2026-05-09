namespace Core.Application.UseCases.Auth.Login;

// Output of the Login use case.
//
// AccessToken     : signed JWT used by the client on every authenticated request.
// RefreshToken    : opaque, high-entropy random string the client trades for a
//                   fresh access token once the current one expires. It is NOT a
//                   JWT — it carries no claims, only a server-side identifier.
// ExpiresAt       : absolute UTC instant when the AccessToken stops being valid.
//                   Returning the absolute timestamp (instead of a relative
//                   "expiresIn" number of seconds) avoids client-side clock-drift
//                   bugs around "when do I refresh?".
public record LoginResult(string AccessToken, string RefreshToken, DateTime ExpiresAt);
