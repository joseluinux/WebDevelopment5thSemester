namespace Core.Application.UseCases.Products.GetProducts;

// Input for "list every product in a MEI", optionally filtered by status.
//
// MeiId comes from the URL path, UserId from the JWT, Status from the
// query-string. Null/empty Status = "do not filter".
public record GetProductsQuery(Guid MeiId, Guid UserId, string? Status);
