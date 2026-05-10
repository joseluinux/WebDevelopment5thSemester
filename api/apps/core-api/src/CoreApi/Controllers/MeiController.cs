using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using Core.Application.UseCases.Meis.CreateMei;
using Core.Application.UseCases.Meis.DeleteMei;
using Core.Application.UseCases.Meis.GetMei;
using Core.Application.UseCases.Meis.GetMeis;
using Core.Application.UseCases.Meis.UpdateMei;
using Core.Domain.Exceptions;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace CoreApi.Controllers;

// All MEI endpoints live behind [Authorize] applied at the class level — a
// missing JWT short-circuits with 401 before any action runs. Every action
// then re-derives the user id from the validated JWT (NEVER from the URL or
// body) and forwards it to the application layer.
[ApiController]
[Authorize]
[Route("v1/meis")]
public class MeiController : ControllerBase
{
    private readonly GetMeisHandler _getMeisHandler;
    private readonly GetMeiHandler _getMeiHandler;
    private readonly CreateMeiHandler _createMeiHandler;
    private readonly UpdateMeiHandler _updateMeiHandler;
    private readonly DeleteMeiHandler _deleteMeiHandler;

    public MeiController(
        GetMeisHandler getMeisHandler,
        GetMeiHandler getMeiHandler,
        CreateMeiHandler createMeiHandler,
        UpdateMeiHandler updateMeiHandler,
        DeleteMeiHandler deleteMeiHandler)
    {
        _getMeisHandler = getMeisHandler;
        _getMeiHandler = getMeiHandler;
        _createMeiHandler = createMeiHandler;
        _updateMeiHandler = updateMeiHandler;
        _deleteMeiHandler = deleteMeiHandler;
    }

    // GET /v1/meis — list every MEI owned by the authenticated user.
    [HttpGet]
    public async Task<IActionResult> GetAll(CancellationToken cancellationToken)
    {
        if (!TryGetUserId(out var userId))
            return Unauthorized(new { error = "Invalid token subject." });

        var result = await _getMeisHandler.HandleAsync(new GetMeisQuery(userId), cancellationToken);
        return Ok(result);
    }

    // POST /v1/meis — create a new MEI for the authenticated user.
    [HttpPost]
    public async Task<IActionResult> Create([FromBody] CreateMeiDto dto, CancellationToken cancellationToken)
    {
        if (!TryGetUserId(out var userId))
            return Unauthorized(new { error = "Invalid token subject." });

        try
        {
            // Map the transport DTO to the application command. UserId comes
            // from the JWT — even if the client sent a UserId field, we would
            // ignore it. The body cannot dictate ownership.
            var command = new CreateMeiCommand(
                userId, dto.Name, dto.Cnpj, dto.Cnae, dto.AnnualLimit, dto.Plan);

            var result = await _createMeiHandler.HandleAsync(command, cancellationToken);

            // 201 Created with a Location header pointing at the canonical
            // resource URL — standard REST practice for "POST that created
            // a resource".
            return CreatedAtAction(nameof(GetById), new { meiId = result.Id }, result);
        }
        catch (InvalidOperationException ex)
        {
            // Duplicate-CNPJ-for-this-user — see CreateMeiHandler. 409
            // Conflict is the right HTTP code for "request would violate a
            // resource-state invariant".
            return Conflict(new { error = ex.Message });
        }
    }

    // GET /v1/meis/{meiId} — fetch one MEI, ownership-checked.
    [HttpGet("{meiId:guid}")]
    public async Task<IActionResult> GetById([FromRoute] Guid meiId, CancellationToken cancellationToken)
    {
        if (!TryGetUserId(out var userId))
            return Unauthorized(new { error = "Invalid token subject." });

        try
        {
            var result = await _getMeiHandler.HandleAsync(new GetMeiQuery(userId, meiId), cancellationToken);
            return Ok(result);
        }
        catch (MeiNotFoundException ex)
        {
            return NotFound(new { error = ex.Message });
        }
        catch (UnauthorizedAccessException ex)
        {
            // 403 Forbidden, NOT 401: the caller IS authenticated, they're
            // just not authorised for this specific resource. Mixing these up
            // is a classic mistake — 401 should be reserved for "no/invalid
            // credentials".
            return StatusCode(StatusCodes.Status403Forbidden, new { error = ex.Message });
        }
    }

    // PUT /v1/meis/{meiId} — update editable fields of one MEI.
    [HttpPut("{meiId:guid}")]
    public async Task<IActionResult> Update(
        [FromRoute] Guid meiId,
        [FromBody] UpdateMeiDto dto,
        CancellationToken cancellationToken)
    {
        if (!TryGetUserId(out var userId))
            return Unauthorized(new { error = "Invalid token subject." });

        try
        {
            var command = new UpdateMeiCommand(
                userId, meiId, dto.Name, dto.Cnae, dto.AnnualLimit, dto.Plan);
            var result = await _updateMeiHandler.HandleAsync(command, cancellationToken);
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

    // DELETE /v1/meis/{meiId} — hard-delete one MEI (cascade in AppDbContext
    // takes care of dependent rows: transactions, products, employees, etc.).
    [HttpDelete("{meiId:guid}")]
    public async Task<IActionResult> Delete([FromRoute] Guid meiId, CancellationToken cancellationToken)
    {
        if (!TryGetUserId(out var userId))
            return Unauthorized(new { error = "Invalid token subject." });

        try
        {
            await _deleteMeiHandler.HandleAsync(new DeleteMeiCommand(userId, meiId), cancellationToken);
            // 204 No Content: success with no body. Matches REST convention
            // for a successful DELETE.
            return NoContent();
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

    // Reads the JWT subject claim and parses it as a Guid.
    //
    // Two claim names are checked for the same reason as in AuthController:
    //   - ClaimTypes.NameIdentifier is what JwtSecurityTokenHandler maps "sub"
    //     to by default (DefaultMapInboundClaims = true).
    //   - JwtRegisteredClaimNames.Sub is the raw claim, in case inbound
    //     mapping has been disabled.
    // Reading both protects this endpoint from a future config change to the
    // bearer pipeline silently breaking authentication.
    //
    // Returns false (not throw) so the controller can map "valid token, bad
    // subject" to 401 with a clear body — throwing would surface as 500.
    private bool TryGetUserId(out Guid userId)
    {
        var subjectClaim = User.FindFirstValue(ClaimTypes.NameIdentifier)
                           ?? User.FindFirstValue(JwtRegisteredClaimNames.Sub);
        return Guid.TryParse(subjectClaim, out userId);
    }
}

// Transport-layer DTOs.
//
// Keeping them in the controller file follows the existing AuthController
// pattern — they belong to the presentation layer and rarely make sense
// to share elsewhere.
//
// Note the absence of UserId on both DTOs: the caller cannot specify
// ownership through the body. UserId is always derived from the JWT.
public record CreateMeiDto(
    string Name,
    string? Cnpj,
    string? Cnae,
    decimal? AnnualLimit,
    string? Plan);

public record UpdateMeiDto(
    string Name,
    string? Cnae,
    decimal? AnnualLimit,
    string? Plan);
