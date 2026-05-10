namespace Core.Application.UseCases.Products.CreateProduct;

// Input for creating a new product.
//
// MeiId comes from the URL, UserId from the JWT — neither can be dictated
// by the body. Cost / Price / DesiredMargin / Status are required at the
// command level even though the entity's columns are nullable: forcing
// them on creation gives a complete row from day one and avoids the
// "what's the margin of this product?" UX hole when fields are missing.
public record CreateProductCommand(
    Guid MeiId,
    Guid UserId,
    string Name,
    decimal Cost,
    decimal Price,
    decimal DesiredMargin,
    string Status);
