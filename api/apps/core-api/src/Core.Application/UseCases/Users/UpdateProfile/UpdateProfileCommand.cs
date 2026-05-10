namespace Core.Application.UseCases.Users.UpdateProfile;

// Input for editing the authenticated user's profile.
//
// UserId comes from the JWT — the request body has no say in *which* user is
// being edited (a /me endpoint by definition only edits the caller).
public record UpdateProfileCommand(Guid UserId, string? Name, string Email);
