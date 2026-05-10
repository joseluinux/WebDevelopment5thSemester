namespace Core.Application.UseCases.Products.DeleteProduct;

// Input for deleting one specific product.
public record DeleteProductCommand(Guid MeiId, Guid UserId, Guid ProductId);
