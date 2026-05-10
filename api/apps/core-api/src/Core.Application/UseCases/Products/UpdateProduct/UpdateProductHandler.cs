using Core.Domain.Exceptions;
using Core.Domain.Interfaces;

namespace Core.Application.UseCases.Products.UpdateProduct;

// Updates the editable fields of one product.
public class UpdateProductHandler
{
    private readonly IProductRepository _productRepository;
    private readonly IMeiRepository _meiRepository;

    public UpdateProductHandler(
        IProductRepository productRepository,
        IMeiRepository meiRepository)
    {
        _productRepository = productRepository;
        _meiRepository = meiRepository;
    }

    public async Task<ProductResult> HandleAsync(
        UpdateProductCommand command,
        CancellationToken cancellationToken = default)
    {
        // Step 1 — Parent MEI ownership.
        var mei = await _meiRepository.GetByIdAsync(command.MeiId, cancellationToken);
        if (mei is null)
            throw new MeiNotFoundException(command.MeiId);
        if (mei.UserId != command.UserId)
            throw new UnauthorizedAccessException("You do not have access to this MEI.");

        // Step 2 — Input validation BEFORE mutating anything. Same rules
        // as create — see CreateProductHandler comments.
        if (!InvalidProductStatusException.ValidStatuses.Contains(command.Status))
            throw new InvalidProductStatusException(command.Status);
        if (command.Price <= 0)
            throw new InvalidProductPriceException(command.Price);

        // Step 3 — Load and verify the product is in this MEI. Same combined
        // exception used by GetProductHandler — cross-MEI probe resistance.
        var product = await _productRepository.GetByIdAsync(command.ProductId, cancellationToken);
        if (product is null || product.MeiId != command.MeiId)
            throw new ProductNotFoundException(command.ProductId);

        // Step 4 — Apply only the editable fields. Id, MeiId, CreatedAt
        // are intentionally NOT touched — they are not part of the
        // editable surface.
        product.Name = command.Name;
        product.Cost = command.Cost;
        product.Price = command.Price;
        product.DesiredMargin = command.DesiredMargin;
        product.Status = command.Status;
        product.UpdatedAt = DateTime.UtcNow;

        await _productRepository.UpdateAsync(product, cancellationToken);

        return ProductMapper.ToResult(product);
    }
}
