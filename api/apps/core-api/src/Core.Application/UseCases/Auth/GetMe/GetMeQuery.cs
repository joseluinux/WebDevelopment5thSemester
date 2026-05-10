namespace Core.Application.UseCases.Auth.GetMe;

// Input for the "who am I?" use case.
//
// The handler trusts UserId because it must have been extracted from a JWT
// claim that was validated by the JwtBearer middleware. The application layer
// itself does not re-validate the token — token validity is a presentation-
// layer concern and is enforced before this query is ever issued.
public record GetMeQuery(Guid UserId);
