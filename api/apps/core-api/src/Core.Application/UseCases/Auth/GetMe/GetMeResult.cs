namespace Core.Application.UseCases.Auth.GetMe;

// Public profile projection of the User entity.
//
// Security invariant: this DTO MUST NOT contain PasswordHash (or any other
// sensitive field). Returning the User entity directly from a controller would
// serialize every property — including the BCrypt hash — into the response
// body. A dedicated, narrow DTO is the only safe shape for the wire.
//
// CreatedAt is included because clients commonly display "member since" info;
// add new fields here only after confirming they are safe to expose publicly.
public record GetMeResult(Guid Id, string? Name, string Email, DateTime CreatedAt);
