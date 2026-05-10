using Core.Domain.Exceptions;
using Core.Domain.Interfaces;

namespace Core.Application.UseCases.Products.DeleteProduct;

// Hard-deletes one product, after every security check has cleared.
public class DeleteProductHandler
{
    private readonly IProductRepository _productRepository;
    private readonly IMeiRepository _meiRepository;

    public DeleteProductHandler(
        IProductRepository productRepository,
        IMeiRepository meiRepository)
    {
        _productRepository = productRepository;
        _meiRepository = meiRepository;
    }

    public async Task HandleAsync(
        DeleteProductCommand command,
        CancellationToken cancellationToken = default)
    {
        // Step 1 — Parent MEI ownership.
        var mei = await _meiRepository.GetByIdAsync(command.MeiId, cancellationToken);
        if (mei is null)
            throw new MeiNotFoundException(command.MeiId);
        if (mei.UserId != command.UserId)
            throw new UnauthorizedAccessException("You do not have access to this MEI.");

        // Step 2 — Product existence + cross-MEI guard.
        var product = await _productRepository.GetByIdAsync(command.ProductId, cancellationToken);
        if (product is null || product.MeiId != command.MeiId)
            throw new ProductNotFoundException(command.ProductId);

        // Step 3 — Delete. Repository's DeleteAsync uses FindAsync under
        // the hood, so the entity already loaded above is reused without
        // hitting the DB again.
        await _productRepository.DeleteAsync(product.Id, cancellationToken);
    }
}
