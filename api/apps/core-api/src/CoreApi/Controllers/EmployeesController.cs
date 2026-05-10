using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using Core.Application.UseCases.Employees.CreateEmployee;
using Core.Application.UseCases.Employees.GetEmployees;
using Core.Domain.Exceptions;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace CoreApi.Controllers;

// Nested route — every employee lives under its parent MEI in the URL,
// matching ProductsController/TransactionsController. Class-level
// [Authorize] + per-handler ownership checks give defence-in-depth.
[ApiController]
[Authorize]
[Route("v1/meis/{meiId:guid}/employees")]
public class EmployeesController : ControllerBase
{
    private readonly GetEmployeesHandler _getEmployeesHandler;
    private readonly CreateEmployeeHandler _createEmployeeHandler;

    public EmployeesController(
        GetEmployeesHandler getEmployeesHandler,
        CreateEmployeeHandler createEmployeeHandler)
    {
        _getEmployeesHandler = getEmployeesHandler;
        _createEmployeeHandler = createEmployeeHandler;
    }

    // GET /v1/meis/{meiId}/employees
    [HttpGet]
    public async Task<IActionResult> GetAll(
        [FromRoute] Guid meiId,
        CancellationToken cancellationToken)
    {
        if (!TryGetUserId(out var userId))
            return Unauthorized(new { error = "Invalid token subject." });

        try
        {
            var result = await _getEmployeesHandler.HandleAsync(
                new GetEmployeesQuery(meiId, userId),
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

    // POST /v1/meis/{meiId}/employees
    //
    // No per-employee GET endpoint exists in this slice, so we don't have
    // a canonical resource URL to put in a Location header. We return
    // 201 with no body — once a per-employee endpoint lands, this can
    // upgrade to CreatedAtAction.
    [HttpPost]
    public async Task<IActionResult> Create(
        [FromRoute] Guid meiId,
        [FromBody] CreateEmployeeDto dto,
        CancellationToken cancellationToken)
    {
        if (!TryGetUserId(out var userId))
            return Unauthorized(new { error = "Invalid token subject." });

        try
        {
            var command = new CreateEmployeeCommand(
                meiId, userId, dto.Name, dto.ContractType, dto.Salary, dto.Charges);
            await _createEmployeeHandler.HandleAsync(command, cancellationToken);
            return StatusCode(StatusCodes.Status201Created);
        }
        catch (MeiNotFoundException ex)
        {
            return NotFound(new { error = ex.Message });
        }
        catch (UnauthorizedAccessException ex)
        {
            return StatusCode(StatusCodes.Status403Forbidden, new { error = ex.Message });
        }
        catch (InvalidContractTypeException ex)
        {
            // 400 Bad Request: syntactically valid JSON, semantically wrong.
            return BadRequest(new { error = ex.Message });
        }
        catch (InvalidSalaryException ex)
        {
            return BadRequest(new { error = ex.Message });
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

// Transport DTO. No MeiId/UserId — both come from the URL/JWT.
public record CreateEmployeeDto(
    string Name,
    string ContractType,
    decimal Salary,
    decimal Charges);
