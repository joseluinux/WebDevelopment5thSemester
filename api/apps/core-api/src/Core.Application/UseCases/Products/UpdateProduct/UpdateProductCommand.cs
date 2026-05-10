namespace Core.Application.UseCases.Products.UpdateProduct;

// Input for editing an existing product. Same id-trio pattern as
// GetProductQuery (UserId from JWT, MeiId + ProductId from URL).
public record UpdateProductCommand(
    Guid MeiId,
    Guid UserId,
    Guid ProductId,
    string Name,
    decimal Cost,
    decimal Price,
    decimal DesiredMargin,
    string Status);
