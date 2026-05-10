namespace Core.Application.UseCases.Auth.Refresh;

// Input for the refresh-token rotation use case.
//
// The refresh token IS the credential here — there is no other authentication
// material on this request. That is why POST /v1/auth/refresh is intentionally
// unauthenticated at the [Authorize] level: the caller proves identity by
// presenting the token itself.
public record RefreshCommand(string Token);
