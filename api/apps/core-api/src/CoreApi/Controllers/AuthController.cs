using Core.Application.UseCases.Auth.Register;
using Core.Domain.Exceptions;
using Microsoft.AspNetCore.Mvc;

namespace CoreApi.Controllers;

// The controller's only responsibility is translation between HTTP and the application layer.
// It receives HTTP input, delegates to the handler, and maps outcomes back to HTTP status codes.
[ApiController]
[Route("v1/auth")]
public class AuthController : ControllerBase
{
    private readonly RegisterHandler _registerHandler;

    public AuthController(RegisterHandler registerHandler)
    {
        _registerHandler = registerHandler;
    }

    [HttpPost("register")]
    public async Task<IActionResult> Register([FromBody] RegisterDto dto, CancellationToken cancellationToken)
    {
        try
        {
            // Map the HTTP transport object (RegisterDto) to an application-layer command,
            // then delegate all business logic to the handler.
            var command = new RegisterCommand(dto.Name, dto.Email, dto.Password);
            await _registerHandler.HandleAsync(command, cancellationToken);
            // 201 Created: the resource was successfully created.
            return StatusCode(201);
        }
        catch (EmailAlreadyTakenException ex)
        {
            // 409 Conflict: the email is already in use — map the domain exception to HTTP.
            return Conflict(new { error = ex.Message });
        }
        // CancellationToken is propagated from the HTTP request lifecycle all the way to
        // the database query, enabling proper cancellation if the client disconnects.
    }
}

// RegisterDto is a transport-layer object (JSON body shape) and belongs here in the
// presentation layer — not in the domain or application layers.
public record RegisterDto(string Name, string Email, string Password);
