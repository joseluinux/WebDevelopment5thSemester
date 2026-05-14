using Core.Application.DTOs;
using Core.Application.UseCases.Imports.PreviewImport;

namespace Core.Application.UseCases.Imports.ConfirmImport;

// The frontend sends back the PreviewImportResult it received, plus
// MeiId/UserId from the JWT. The handler creates all DB records.
public record ConfirmImportCommand(
    Guid MeiId,
    Guid UserId,
    PreviewImportResult Preview);
