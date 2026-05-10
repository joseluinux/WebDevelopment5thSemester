using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using Core.Application.UseCases.Products.CreateProduct;
using Core.Application.UseCases.Products.DeleteProduct;
using Core.Application.UseCases.Products.GetProduct;
using Core.Application.UseCases.Products.GetProducts;
using Core.Application.UseCases.Products.UpdateProduct;
using Core.Domain.Exceptions;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace CoreApi.Controllers;

// Nested route — every product is scoped under its parent MEI in the URL,
// matching the TransactionsController shape. Class-level [Authorize] +
// per-handler ownership checks give defence-in-depth.
[ApiController]
[Authorize]
[Route("v1/meis/{meiId:guid}/products")]
public class ProductsController : ControllerBase
{
    private readonly GetProductsHandler _getProductsHandler;
    private readonly GetProductHandler _getProductHandler;
    private readonly CreateProductHandler _createProductHandler;
    private readonly UpdateProductHandler _updateProductHandler;
    private readonly DeleteProductHandler _deleteProductHandler;

    public ProductsController(
        GetProductsHandler getProductsHandler,
        GetProductHandler getProductHandler,
        CreateProductHandler createProductHandler,
        UpdateProductHandler updateProductHandler,
        DeleteProductHandler deleteProductHandler)
    {
        _getProductsHandler = getProductsHandler;
        _getProductHandler = getProductHandler;
        _createProductHandler = createProductHandler;
        _updateProductHandler = updateProductHandler;
        _deleteProductHandler = deleteProductHandler;
    }

    // GET /v1/meis/{meiId}/products?status=
    [HttpGet]
    public async Task<IActionResult> GetAll(
        [FromRoute] Guid meiId,
        [FromQuery] string? status,
        CancellationToken cancellationToken)
    {
        if (!TryGetUserId(out var userId))
            return Unauthorized(new { error = "Invalid token subject." });

        try
        {
            var result = await _getProductsHandler.HandleAsync(
                new GetProductsQuery(meiId, userId, status),
                cancellationToken);
            return Ok(result);
        }
        catch (MeiNotFoundException ex)
        {
            return NotFound(new { error = ex.Message });
        }
        catch (UnauthorizedAccessException ex)
        {
            return StatusCode(StatusCodes.Status403Forbidden, new { error = ex.Message });
        }
    }

    // GET /v1/meis/{meiId}/products/{id}
    [HttpGet("{id:guid}")]
    public async Task<IActionResult> GetById(
        [FromRoute] Guid meiId,
        [FromRoute] Guid id,
        CancellationToken cancellationToken)
    {
        if (!TryGetUserId(out var userId))
            return Unauthorized(new { error = "Invalid token subject." });

        try
        {
            var result = await _getProductHandler.HandleAsync(
                new GetProductQuery(meiId, userId, id),
                cancellationToken);
            return Ok(result);
        }
        catch (MeiNotFoundException ex)
        {
            return NotFound(new { error = ex.Message });
        }
        catch (ProductNotFoundException ex)
        {
            return NotFound(new { error = ex.Message });
        }
        catch (UnauthorizedAccessException ex)
        {
            return StatusCode(StatusCodes.Status403Forbidden, new { error = ex.Message });
        }
    }

    // POST /v1/meis/{meiId}/products
    [HttpPost]
    public async Task<IActionResult> Create(
        [FromRoute] Guid meiId,
        [FromBody] CreateProductDto dto,
        CancellationToken cancellationToken)
    {
        if (!TryGetUserId(out var userId))
            return Unauthorized(new { error = "Invalid token subject." });

        try
        {
            var command = new CreateProductCommand(
                meiId, userId, dto.Name, dto.Cost, dto.Price, dto.DesiredMargin, dto.Status);
            var result = await _createProductHandler.HandleAsync(command, cancellationToken);
            return CreatedAtAction(nameof(GetById), new { meiId, id = result.Id }, result);
        }
        catch (MeiNotFoundException ex)
        {
            return NotFound(new { error = ex.Message });
        }
        catch (UnauthorizedAccessException ex)
        {
            return StatusCode(StatusCodes.Status403Forbidden, new { error = ex.Message });
        }
        catch (InvalidProductStatusException ex)
        {
            // 400 Bad Request: syntactically valid JSON, semantically wrong.
            return BadRequest(new { error = ex.Message });
        }
        catch (InvalidProductPriceException ex)
        {
            return BadRequest(new { error = ex.Message });
        }
    }

    // PUT /v1/meis/{meiId}/products/{id}
    [HttpPut("{id:guid}")]
    public async Task<IActionResult> Update(
        [FromRoute] Guid meiId,
        [FromRoute] Guid id,
        [FromBody] UpdateProductDto dto,
        CancellationToken cancellationToken)
    {
        if (!TryGetUserId(out var userId))
            return Unauthorized(new { error = "Invalid token subject." });

        try
        {
            var command = new UpdateProductCommand(
                meiId, userId, id, dto.Name, dto.Cost, dto.Price, dto.DesiredMargin, dto.Status);
            var result = await _updateProductHandler.HandleAsync(command, cancellationToken);
            return Ok(result);
        }
        catch (MeiNotFoundException ex)
        {
            return NotFound(new { error = ex.Message });
        }
        catch (ProductNotFoundException ex)
        {
            return NotFound(new { error = ex.Message });
        }
        catch (UnauthorizedAccessException ex)
        {
            return StatusCode(StatusCodes.Status403Forbidden, new { error = ex.Message });
        }
        catch (InvalidProductStatusException ex)
        {
            return BadRequest(new { error = ex.Message });
        }
        catch (InvalidProductPriceException ex)
        {
            return BadRequest(new { error = ex.Message });
        }
    }

    // DELETE /v1/meis/{meiId}/products/{id}
    [HttpDelete("{id:guid}")]
    public async Task<IActionResult> Delete(
        [FromRoute] Guid meiId,
        [FromRoute] Guid id,
        CancellationToken cancellationToken)
    {
        if (!TryGetUserId(out var userId))
            return Unauthorized(new { error = "Invalid token subject." });

        try
        {
            await _deleteProductHandler.HandleAsync(
                new DeleteProductCommand(meiId, userId, id),
                cancellationToken);
            return NoContent();
        }
        catch (MeiNotFoundException ex)
        {
            return NotFound(new { error = ex.Message });
        }
        catch (ProductNotFoundException ex)
        {
            return NotFound(new { error = ex.Message });
        }
        catch (UnauthorizedAccessException ex)
        {
            return StatusCode(StatusCodes.Status403Forbidden, new { error = ex.Message });
        }
    }

    // Same JWT-subject extraction as the other controllers — checks both
    // the mapped (NameIdentifier) and raw (sub) claim names so a future
    // config change to inbound claim mapping cannot silently break this
    // controller.
    private bool TryGetUserId(out Guid userId)
    {
        var subjectClaim = User.FindFirstValue(ClaimTypes.NameIdentifier)
                           ?? User.FindFirstValue(JwtRegisteredClaimNames.Sub);
        return Guid.TryParse(subjectClaim, out userId);
    }
}

// Transport DTOs. Note the absence of MeiId/UserId on both — body cannot
// dictate ownership; both come from the URL/JWT.
public record CreateProductDto(
    string Name,
    decimal Cost,
    decimal Price,
    decimal DesiredMargin,
    string Status);

public record UpdateProductDto(
    string Name,
    decimal Cost,
    decimal Price,
    decimal DesiredMargin,
    string Status);
