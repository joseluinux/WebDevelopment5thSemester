namespace Core.Application.UseCases.Users.GetProfile;

// Wire-safe projection of the User entity for the profile endpoints.
//
// Security invariant: this DTO MUST NOT contain PasswordHash. Serializing
// the entity directly would expose the BCrypt hash to anyone who calls
// GET /v1/users/me — a critical credential leak. A dedicated narrow DTO
// makes that whole class of bug impossible.
//
// Also returned by PUT /v1/users/me (the updated profile) so clients only
// need to know one shape for "user profile".
public record GetProfileResult(Guid Id, string? Name, string Email, DateTime CreatedAt);
