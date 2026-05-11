namespace Core.Application.UseCases.Auth.ResetPassword;

// Input for POST /v1/auth/reset-password — the user submits the opaque
// token they received by email plus the password they want to set.
public record ResetPasswordCommand(string Token, string NewPassword);
