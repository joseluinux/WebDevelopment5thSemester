namespace Core.Application.UseCases.Meis.GetMeis;

// Input for "list every MEI the authenticated user owns".
//
// UserId is supplied by the controller from the JWT subject claim — it is
// NEVER read from the request body. That is the entire point of multi-tenant
// authorisation: the caller cannot ask for someone else's data by simply
// changing a parameter.
public record GetMeisQuery(Guid UserId);
