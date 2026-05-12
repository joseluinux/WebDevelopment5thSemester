using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using Core.Application.UseCases.Imports;
using Core.Application.UseCases.Imports.CreateImport;
using Core.Application.UseCases.Imports.GetImport;
using Core.Application.UseCases.Imports.GetImports;
using Core.Domain.Exceptions;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace CoreApi.Controllers;

// Nested route — imports live under their parent MEI in the URL,
// matching every other entity-under-MEI controller. Class-level
// [Authorize] + per-handler ownership checks give defence-in-depth.
[ApiController]
[Authorize]
[Route("v1/meis/{meiId:guid}/imports")]
public class ImportsController : ControllerBase
{
    // 10 MiB ceiling enforced at the controller boundary. Larger files
    // are rejected with 400 before hitting Supabase or FastAPI — the
    // LLM cost of a 100MB CSV would dwarf anything else in the system.
    private const long MaxFileSizeBytes = 10L * 1024 * 1024;

    // Allowed MIME hints, used as a secondary check against the
    // extension. Browsers send slightly different values for XLSX
    // depending on platform, so we keep both common ones.
    private static readonly HashSet<string> AllowedExtensions = new(StringComparer.OrdinalIgnoreCase)
    {
        ".csv",
        ".xlsx"
    };

    private readonly CreateImportHandler _createImportHandler;
    private readonly GetImportsHandler _getImportsHandler;
    private readonly GetImportHandler _getImportHandler;

    public ImportsController(
        CreateImportHandler createImportHandler,
        GetImportsHandler getImportsHandler,
        GetImportHandler getImportHandler)
    {
        _createImportHandler = createImportHandler;
        _getImportsHandler = getImportsHandler;
        _getImportHandler = getImportHandler;
    }

    // POST /v1/meis/{meiId}/imports
    //
    // multipart/form-data upload. The single field name is "file".
    // Returns 201 Created with the final Import row in the body.
    [HttpPost]
    // RequestSizeLimit mirrors MaxFileSizeBytes so Kestrel rejects
    // oversize requests at the socket level too — saves us from
    // streaming megabytes only to refuse them in code.
    [RequestSizeLimit(MaxFileSizeBytes)]
    public async Task<IActionResult> Create(
        [FromRoute] Guid meiId,
        IFormFile? file,
        CancellationToken cancellationToken)
    {
        if (!TryGetUserId(out var userId))
            return Unauthorized(new { error = "Invalid token subject." });

        // File-presence check. ASP.NET binds IFormFile to null when the
        // multipart part is missing; no exception is thrown.
        if (file is null || file.Length == 0)
            return BadRequest(new { error = "A file is required." });

        // Extension check. We rely on the file name extension because
        // the Content-Type header from a browser is unreliable for CSV
        // (often "application/vnd.ms-excel", sometimes "text/plain").
        var extension = Path.GetExtension(file.FileName);
        if (string.IsNullOrEmpty(extension) || !AllowedExtensions.Contains(extension))
            return BadRequest(new
            {
                error = $"Unsupported file type '{extension}'. Allowed: .csv, .xlsx."
            });

        // Size check (defence in depth — RequestSizeLimit also enforces
        // this, but a per-file check is cheap and more informative
        // when multiple parts are uploaded in the future).
        if (file.Length > MaxFileSizeBytes)
            return BadRequest(new { error = $"File exceeds the {MaxFileSizeBytes} byte limit." });

        try
        {
            // OpenReadStream gives a stream the handler reads ONCE and
            // forwards to Supabase. We do not need to dispose it
            // explicitly: the framework disposes IFormFile-owned
            // streams at the end of the request.
            var command = new CreateImportCommand(
                meiId,
                userId,
                file.FileName,
                file.OpenReadStream(),
                file.ContentType ?? "application/octet-stream");

            var result = await _createImportHandler.HandleAsync(command, cancellationToken);

            // 201 with a Location header pointing to the GET-by-id
            // route — gives clients a canonical URL to poll if the
            // status came back as "processing" in the future.
            return CreatedAtAction(
                nameof(GetById),
                new { meiId, id = result.Id },
                result);
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

    // GET /v1/meis/{meiId}/imports
    [HttpGet]
    public async Task<IActionResult> GetAll(
        [FromRoute] Guid meiId,
        CancellationToken cancellationToken)
    {
        if (!TryGetUserId(out var userId))
            return Unauthorized(new { error = "Invalid token subject." });

        try
        {
            var result = await _getImportsHandler.HandleAsync(
                new GetImportsQuery(meiId, userId),
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

    // GET /v1/meis/{meiId}/imports/{id}
    //
    // Action name "GetById" is referenced from CreatedAtAction in
    // Create(...) — keep the two in sync if the method is renamed.
    [HttpGet("{id:guid}", Name = nameof(GetById))]
    public async Task<IActionResult> GetById(
        [FromRoute] Guid meiId,
        [FromRoute] Guid id,
        CancellationToken cancellationToken)
    {
        if (!TryGetUserId(out var userId))
            return Unauthorized(new { error = "Invalid token subject." });

        try
        {
            var result = await _getImportHandler.HandleAsync(
                new GetImportQuery(meiId, userId, id),
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
        catch (ImportNotFoundException ex)
        {
            return NotFound(new { error = ex.Message });
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
