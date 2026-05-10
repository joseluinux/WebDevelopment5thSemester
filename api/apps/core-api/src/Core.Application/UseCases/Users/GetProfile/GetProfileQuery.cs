namespace Core.Application.UseCases.Users.GetProfile;

// Input for "fetch the authenticated user's profile".
//
// UserId is supplied by the controller from the JWT subject claim — it is
// NEVER read from a request body or URL parameter. That is the entire point
// of the /me convention: the caller cannot ask for someone else's data.
public record GetProfileQuery(Guid UserId);
