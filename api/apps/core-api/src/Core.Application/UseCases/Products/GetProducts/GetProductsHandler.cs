using Core.Domain.Exceptions;
using Core.Domain.Interfaces;

namespace Core.Application.UseCases.Products.GetProducts;

// Returns every product in the given MEI, after verifying the caller owns
// it. Each row carries its calculated margin — see ProductMapper for the
// formula and rationale.
public class GetProductsHandler
{
    private readonly IProductRepository _productRepository;
    private readonly IMeiRepository _meiRepository;

    public GetProductsHandler(
        IProductRepository productRepository,
        IMeiRepository meiRepository)
    {
        _productRepository = productRepository;
        _meiRepository = meiRepository;
    }

    public async Task<IReadOnlyList<ProductResult>> HandleAsync(
        GetProductsQuery query,
        CancellationToken cancellationToken = default)
    {
        // Step 1 — Parent MEI ownership.
        var mei = await _meiRepository.GetByIdAsync(query.MeiId, cancellationToken);
        if (mei is null)
            throw new MeiNotFoundException(query.MeiId);
        if (mei.UserId != query.UserId)
            throw new UnauthorizedAccessException("You do not have access to this MEI.");

        // Step 2 — Filtered read.
        var rows = await _productRepository.GetAllByMeiIdAsync(
            query.MeiId, query.Status, cancellationToken);

        // Step 3 — Project, attaching the calculated Margin/IsMarginBelowDesired
        // via the shared mapper so list and single-item endpoints stay
        // mathematically identical.
        return rows.Select(ProductMapper.ToResult).ToList();
    }
}
