using Core.Domain.Exceptions;
using Core.Domain.Interfaces;
using Core.Infrastructure;

namespace Core.Application.UseCases.Products.CreateProduct;

// Creates a new product inside an authenticated user's MEI.
public class CreateProductHandler
{
    private readonly IProductRepository _productRepository;
    private readonly IMeiRepository _meiRepository;

    public CreateProductHandler(
        IProductRepository productRepository,
        IMeiRepository meiRepository)
    {
        _productRepository = productRepository;
        _meiRepository = meiRepository;
    }

    public async Task<ProductResult> HandleAsync(
        CreateProductCommand command,
        CancellationToken cancellationToken = default)
    {
        // Step 1 — Parent MEI ownership.
        // Performing the ownership check BEFORE input validation matters:
        // a probe against someone else's MEI must get 403, not a helpful
        // "your status is wrong" hint.
        var mei = await _meiRepository.GetByIdAsync(command.MeiId, cancellationToken);
        if (mei is null)
            throw new MeiNotFoundException(command.MeiId);
        if (mei.UserId != command.UserId)
            throw new UnauthorizedAccessException("You do not have access to this MEI.");

        // Step 2 — Status validation. Canonical valid set lives on the
        // exception class so handlers can't drift.
        if (!InvalidProductStatusException.ValidStatuses.Contains(command.Status))
            throw new InvalidProductStatusException(command.Status);

        // Step 3 — Price validation. Strictly positive: zero is rejected
        // because it would make the margin formula meaningless (division
        // by zero) and almost certainly indicates a UI/import bug.
        if (command.Price <= 0)
            throw new InvalidProductPriceException(command.Price);

        // Step 4 — Build the entity. Id is generated in the application
        // layer so we can include it in the response without a round-trip.
        // Margin is intentionally NOT stored — it's recomputed from
        // Cost/Price on every read so it can never drift (see ProductMapper).
        var product = new Product
        {
            Id = Guid.NewGuid(),
            MeiId = command.MeiId,
            Name = command.Name,
            Cost = command.Cost,
            Price = command.Price,
            DesiredMargin = command.DesiredMargin,
            Status = command.Status,
            CreatedAt = DateTime.UtcNow
        };

        await _productRepository.AddAsync(product, cancellationToken);

        return ProductMapper.ToResult(product);
    }
}
