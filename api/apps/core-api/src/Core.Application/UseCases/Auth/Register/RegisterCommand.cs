namespace Core.Application.UseCases.Auth.Register;

// A Command is a plain, immutable data object that carries the user's intent.
// It has no behavior — it only holds what is needed to perform the registration.
// Using a record gives immutability and value-based equality for free.
// This separates *what the user wants to do* from *how it gets done* (which is the Handler's job).
public record RegisterCommand(string Name, string Email, string Password);
