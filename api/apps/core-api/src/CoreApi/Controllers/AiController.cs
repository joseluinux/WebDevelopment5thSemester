using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using Core.Application.UseCases.Ai.GetAiContext;
using Core.Application.UseCases.Ai.GetFinancialSummary;
using Core.Domain.Exceptions;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace CoreApi.Controllers;

// AI-facing read endpoints. These exist so the FastAPI agent can pull
// structured context about a MEI without re-implementing aggregations
// against the raw tables. They DO NOT call FastAPI themselves — see
// CreateImportHandler for the C# -> FastAPI direction.
//
// Class-level [Authorize] + per-handler ownership checks give
// defence-in-depth, matching every other entity-under-MEI controller.
[ApiController]
[Authorize]
[Route("v1/meis/{meiId:guid}/ai")]
public class AiController : ControllerBase
{
    private readonly GetAiContextHandler _getAiContextHandler;
    private readonly GetFinancialSummaryHandler _getFinancialSummaryHandler;

    public AiController(
        GetAiContextHandler getAiContextHandler,
        GetFinancialSummaryHandler getFinancialSummaryHandler)
    {
        _getAiContextHandler = getAiContextHandler;
        _getFinancialSummaryHandler = getFinancialSummaryHandler;
    }

    // GET /v1/meis/{meiId}/ai/context
    //
    // Returns the at-a-glance snapshot the agent loads at the start
    // of every conversation. No query parameters: this endpoint is
    // deliberately scope-free so the agent always sees the same shape
    // regardless of the user's question.
    [HttpGet("context")]
    public async Task<IActionResult> GetContext(
        [FromRoute] Guid meiId,
        CancellationToken cancellationToken)
    {
        if (!TryGetUserId(out var userId))
            return Unauthorized(new { error = "Invalid token subject." });

        try
        {
            var result = await _getAiContextHandler.HandleAsync(
                new GetAiContextQuery(meiId, userId),
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

    // GET /v1/meis/{meiId}/ai/financial-summary?from=YYYY-MM-DD&to=YYYY-MM-DD
    //
    // Returns the period-aware breakdown. ASP.NET Core 7+ binds
    // DateOnly natively from the query string, so no custom converter
    // is needed. Either bound may be omitted ("up to", "from", "all
    // time") — the handler formats the resulting Period label
    // accordingly.
    [HttpGet("financial-summary")]
    public async Task<IActionResult> GetFinancialSummary(
        [FromRoute] Guid meiId,
        [FromQuery] DateOnly? from,
        [FromQuery] DateOnly? to,
        CancellationToken cancellationToken)
    {
        if (!TryGetUserId(out var userId))
            return Unauthorized(new { error = "Invalid token subject." });

        try
        {
            var result = await _getFinancialSummaryHandler.HandleAsync(
                new GetFinancialSummaryQuery(meiId, userId, from, to),
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

    // Same JWT-subject extraction as the other controllers — checks
    // both the mapped (NameIdentifier) and raw (sub) claim names so a
    // future config change to inbound claim mapping cannot silently
    // break this controller.
    private bool TryGetUserId(out Guid userId)
    {
        var subjectClaim = User.FindFirstValue(ClaimTypes.NameIdentifier)
                           ?? User.FindFirstValue(JwtRegisteredClaimNames.Sub);
        return Guid.TryParse(subjectClaim, out userId);
    }
}
