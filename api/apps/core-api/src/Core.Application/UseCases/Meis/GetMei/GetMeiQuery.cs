namespace Core.Application.UseCases.Meis.GetMei;

// Input for "fetch a specific MEI".
//
// UserId comes from the JWT, MeiId from the URL path. Carrying both here
// (instead of having the handler read the JWT itself) keeps the handler pure
// and trivially testable.
public record GetMeiQuery(Guid UserId, Guid MeiId);
