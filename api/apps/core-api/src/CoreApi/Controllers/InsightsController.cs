using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using Core.Application.UseCases.Insights.GetInsights;
using Core.Domain.Exceptions;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace CoreApi.Controllers;

[ApiController]
[Authorize]
[Route("v1/meis/{meiId:guid}/insights")]
public class InsightsController : ControllerBase
{
    private readonly GetInsightsHandler _handler;

    public InsightsController(GetInsightsHandler handler) =>
        _handler = handler;

    // GET /v1/meis/{meiId}/insights
    //
    // Returns the full analytics snapshot for the Insights page.
    // No query parameters: this is always an all-time view so the
    // frontend doesn't have to manage date ranges for a summary page.
    [HttpGet]
    public async Task<IActionResult> Get(
        [FromRoute] Guid meiId,
        CancellationToken cancellationToken)
    {
        if (!TryGetUserId(out var userId))
            return Unauthorized(new { error = "Invalid token subject." });

        try
        {
            var result = await _handler.HandleAsync(
                new GetInsightsQuery(meiId, userId), cancellationToken);
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

    private bool TryGetUserId(out Guid userId)
    {
        var claim = User.FindFirstValue(ClaimTypes.NameIdentifier)
                    ?? User.FindFirstValue(JwtRegisteredClaimNames.Sub);
        return Guid.TryParse(claim, out userId);
    }
}
