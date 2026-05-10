using Core.Domain.Exceptions;
using Core.Domain.Interfaces;

namespace Core.Application.UseCases.Products.GetProduct;

// Returns one specific product, scoped to the given MEI, after every
// security check has cleared.
public class GetProductHandler
{
    private readonly IProductRepository _productRepository;
    private readonly IMeiRepository _meiRepository;

    public GetProductHandler(
        IProductRepository productRepository,
        IMeiRepository meiRepository)
    {
        _productRepository = productRepository;
        _meiRepository = meiRepository;
    }

    public async Task<ProductResult> HandleAsync(
        GetProductQuery query,
        CancellationToken cancellationToken = default)
    {
        // Step 1 — Parent MEI must exist and belong to the caller.
        var mei = await _meiRepository.GetByIdAsync(query.MeiId, cancellationToken);
        if (mei is null)
            throw new MeiNotFoundException(query.MeiId);
        if (mei.UserId != query.UserId)
            throw new UnauthorizedAccessException("You do not have access to this MEI.");

        // Step 2 — Product existence + cross-MEI guard.
        // Same combined exception ("doesn't exist" OR "exists under another
        // MEI") so an attacker cannot tell those cases apart by probing.
        var product = await _productRepository.GetByIdAsync(query.ProductId, cancellationToken);
        if (product is null || product.MeiId != query.MeiId)
            throw new ProductNotFoundException(query.ProductId);

        // Step 3 — Project with calculated margin via the shared mapper.
        return ProductMapper.ToResult(product);
    }
}
