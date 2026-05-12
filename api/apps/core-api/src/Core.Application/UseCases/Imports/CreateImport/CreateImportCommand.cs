namespace Core.Application.UseCases.Imports.CreateImport;

// Input for the upload-and-process flow.
//
// MeiId comes from the URL, UserId from the JWT — neither can be
// dictated by the request body. FileName / Stream / ContentType come
// from the multipart upload at the controller boundary; we accept the
// raw Stream here so the handler can hand it straight to IStorageService
// without buffering the whole file into memory twice.
//
// Stream is part of the BCL (System.IO), so passing it through the
// application layer doesn't violate Clean Architecture — there is no
// dependency on ASP.NET Core types (IFormFile lives in the controller).
public record CreateImportCommand(
    Guid MeiId,
    Guid UserId,
    string FileName,
    Stream FileStream,
    string ContentType);
