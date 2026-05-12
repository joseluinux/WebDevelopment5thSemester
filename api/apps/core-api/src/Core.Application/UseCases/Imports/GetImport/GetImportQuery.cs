namespace Core.Application.UseCases.Imports.GetImport;

// Input for "fetch one import by id".
//
// MeiId and ImportId both come from the URL; UserId from the JWT. The
// handler verifies all three are consistent (user owns MEI, import
// belongs to MEI) before returning anything.
public record GetImportQuery(Guid MeiId, Guid UserId, Guid ImportId);
