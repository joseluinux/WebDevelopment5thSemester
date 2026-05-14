namespace Core.Application.UseCases.Imports.PreviewImport;

public record PreviewImportCommand(
    Guid MeiId,
    Guid UserId,
    string FileName,
    Stream FileStream,
    string ContentType);
