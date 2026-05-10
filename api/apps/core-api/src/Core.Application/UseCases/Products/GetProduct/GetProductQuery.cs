namespace Core.Application.UseCases.Products.GetProduct;

// Input for "fetch one specific product".
//
// All three ids are required — UserId (JWT) is who's asking, MeiId (URL)
// scopes the request, ProductId (URL) is the row inside that MEI. The
// handler enforces both "user owns MEI" and "product belongs to MEI".
public record GetProductQuery(Guid MeiId, Guid UserId, Guid ProductId);
