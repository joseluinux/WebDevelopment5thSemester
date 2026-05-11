namespace Core.Application.UseCases.Auth.ForgotPassword;

// Input for "I forgot my password, send me a reset link".
//
// Only the email is needed — the caller is unauthenticated by design
// (they cannot log in, that's the whole point of the flow).
public record ForgotPasswordCommand(string Email);
