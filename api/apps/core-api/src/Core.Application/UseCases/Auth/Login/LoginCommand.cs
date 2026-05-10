namespace Core.Application.UseCases.Auth.Login;

// Immutable input for the Login use case.
// Carries only the user's intent (the credentials they sent) — no behavior, no
// transport concerns. The HTTP DTO is mapped into this command at the controller
// boundary, keeping the application layer free of HTTP knowledge.
public record LoginCommand(string Email, string Password);
