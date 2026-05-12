using Core.Domain.Exceptions;
using Core.Domain.Interfaces;

namespace Core.Application.UseCases.Imports.GetImport;

// Fetches a single import after verifying ownership at every layer:
//   1. user owns the MEI in the URL,
//   2. import exists,
//   3. import belongs to that MEI.
//
// Cross-MEI probes (id of an import belonging to another tenant) return
// the same not-found error as a missing id — the only way to confirm
// existence is to legitimately own the row.
public class GetImportHandler
{
    private readonly IImportRepository _importRepository;
    private readonly IMeiRepository _meiRepository;

    public GetImportHandler(
        IImportRepository importRepository,
        IMeiRepository meiRepository)
    {
        _importRepository = importRepository;
        _meiRepository = meiRepository;
    }

    public async Task<ImportResult> HandleAsync(
        GetImportQuery query,
        CancellationToken cancellationToken = default)
    {
        // Step 1 — Parent MEI ownership.
        var mei = await _meiRepository.GetByIdAsync(query.MeiId, cancellationToken);
        if (mei is null)
            throw new MeiNotFoundException(query.MeiId);
        if (mei.UserId != query.UserId)
            throw new UnauthorizedAccessException("You do not have access to this MEI.");

        // Step 2 — Lookup. Both "missing" and "exists but belongs to a
        // different MEI" funnel into the same exception so a caller
        // cannot differentiate the two cases by trying random GUIDs.
        var import = await _importRepository.GetByIdAsync(query.ImportId, cancellationToken);
        if (import is null || import.MeiId != query.MeiId)
            throw new ImportNotFoundException(query.ImportId);

        // Step 3 — Project to the wire DTO.
        return ImportResultMapper.ToResult(import);
    }
}
