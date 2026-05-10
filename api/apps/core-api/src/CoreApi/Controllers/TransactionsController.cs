using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using Core.Application.UseCases.Transactions.CreateTransaction;
using Core.Application.UseCases.Transactions.DeleteTransaction;
using Core.Application.UseCases.Transactions.GetTransaction;
using Core.Application.UseCases.Transactions.GetTransactions;
using Core.Application.UseCases.Transactions.UpdateTransaction;
using Core.Domain.Exceptions;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace CoreApi.Controllers;

// Nested route: every transaction is scoped under its parent MEI in the URL.
// [Authorize] at the class level + ownership re-checked inside every handler
// gives defence-in-depth: missing JWT -> 401 here, valid JWT but wrong owner
// -> 403 from the handler.
[ApiController]
[Authorize]
[Route("v1/meis/{meiId:guid}/transactions")]
public class TransactionsController : ControllerBase
{
    private readonly GetTransactionsHandler _getTransactionsHandler;
    private readonly GetTransactionHandler _getTransactionHandler;
    private readonly CreateTransactionHandler _createTransactionHandler;
    private readonly UpdateTransactionHandler _updateTransactionHandler;
    private readonly DeleteTransactionHandler _deleteTransactionHandler;

    public TransactionsController(
        GetTransactionsHandler getTransactionsHandler,
        GetTransactionHandler getTransactionHandler,
        CreateTransactionHandler createTransactionHandler,
        UpdateTransactionHandler updateTransactionHandler,
        DeleteTransactionHandler deleteTransactionHandler)
    {
        _getTransactionsHandler = getTransactionsHandler;
        _getTransactionHandler = getTransactionHandler;
        _createTransactionHandler = createTransactionHandler;
        _updateTransactionHandler = updateTransactionHandler;
        _deleteTransactionHandler = deleteTransactionHandler;
    }

    // GET /v1/meis/{meiId}/transactions?from=&to=&type=&category=
    // Each query-string filter is optional. Omitted filters are passed as
    // null all the way through to the repository, which simply skips them.
    [HttpGet]
    public async Task<IActionResult> GetAll(
        [FromRoute] Guid meiId,
        [FromQuery] DateOnly? from,
        [FromQuery] DateOnly? to,
        [FromQuery] string? type,
        [FromQuery] string? category,
        CancellationToken cancellationToken)
    {
        if (!TryGetUserId(out var userId))
            return Unauthorized(new { error = "Invalid token subject." });

        try
        {
            var result = await _getTransactionsHandler.HandleAsync(
                new GetTransactionsQuery(meiId, userId, from, to, type, category),
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

    // GET /v1/meis/{meiId}/transactions/{id}
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
            var result = await _getTransactionHandler.HandleAsync(
                new GetTransactionQuery(meiId, userId, id),
                cancellationToken);
            return Ok(result);
        }
        catch (MeiNotFoundException ex)
        {
            return NotFound(new { error = ex.Message });
        }
        catch (TransactionNotFoundException ex)
        {
            return NotFound(new { error = ex.Message });
        }
        catch (UnauthorizedAccessException ex)
        {
            return StatusCode(StatusCodes.Status403Forbidden, new { error = ex.Message });
        }
    }

    // POST /v1/meis/{meiId}/transactions
    [HttpPost]
    public async Task<IActionResult> Create(
        [FromRoute] Guid meiId,
        [FromBody] CreateTransactionDto dto,
        CancellationToken cancellationToken)
    {
        if (!TryGetUserId(out var userId))
            return Unauthorized(new { error = "Invalid token subject." });

        try
        {
            var command = new CreateTransactionCommand(
                meiId, userId, dto.Type, dto.Category, dto.Amount, dto.Date, dto.Description);
            var result = await _createTransactionHandler.HandleAsync(command, cancellationToken);

            // 201 Created with Location header pointing at the canonical
            // resource URL — standard REST.
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
        catch (InvalidTransactionTypeException ex)
        {
            // 400 Bad Request: the request was syntactically valid JSON but
            // semantically invalid (Type isn't in the allowed set).
            return BadRequest(new { error = ex.Message });
        }
    }

    // PUT /v1/meis/{meiId}/transactions/{id}
    [HttpPut("{id:guid}")]
    public async Task<IActionResult> Update(
        [FromRoute] Guid meiId,
        [FromRoute] Guid id,
        [FromBody] UpdateTransactionDto dto,
        CancellationToken cancellationToken)
    {
        if (!TryGetUserId(out var userId))
            return Unauthorized(new { error = "Invalid token subject." });

        try
        {
            var command = new UpdateTransactionCommand(
                meiId, userId, id, dto.Type, dto.Category, dto.Amount, dto.Date, dto.Description);
            var result = await _updateTransactionHandler.HandleAsync(command, cancellationToken);
            return Ok(result);
        }
        catch (MeiNotFoundException ex)
        {
            return NotFound(new { error = ex.Message });
        }
        catch (TransactionNotFoundException ex)
        {
            return NotFound(new { error = ex.Message });
        }
        catch (UnauthorizedAccessException ex)
        {
            return StatusCode(StatusCodes.Status403Forbidden, new { error = ex.Message });
        }
        catch (InvalidTransactionTypeException ex)
        {
            return BadRequest(new { error = ex.Message });
        }
    }

    // DELETE /v1/meis/{meiId}/transactions/{id}
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
            await _deleteTransactionHandler.HandleAsync(
                new DeleteTransactionCommand(meiId, userId, id),
                cancellationToken);
            return NoContent();
        }
        catch (MeiNotFoundException ex)
        {
            return NotFound(new { error = ex.Message });
        }
        catch (TransactionNotFoundException ex)
        {
            return NotFound(new { error = ex.Message });
        }
        catch (UnauthorizedAccessException ex)
        {
            return StatusCode(StatusCodes.Status403Forbidden, new { error = ex.Message });
        }
    }

    // Same JWT-subject extraction as the other controllers — checks both the
    // mapped (NameIdentifier) and raw (sub) claim names so a future config
    // change to inbound claim mapping can't silently break this controller.
    private bool TryGetUserId(out Guid userId)
    {
        var subjectClaim = User.FindFirstValue(ClaimTypes.NameIdentifier)
                           ?? User.FindFirstValue(JwtRegisteredClaimNames.Sub);
        return Guid.TryParse(subjectClaim, out userId);
    }
}

// Transport DTOs. Note the absence of MeiId/UserId on both — the body cannot
// dictate ownership; both come from the URL/JWT.
public record CreateTransactionDto(
    string Type,
    string? Category,
    decimal Amount,
    DateOnly Date,
    string? Description);

public record UpdateTransactionDto(
    string Type,
    string? Category,
    decimal Amount,
    DateOnly Date,
    string? Description);
