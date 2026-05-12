using Core.Domain.Exceptions;
using Core.Domain.Interfaces;

namespace Core.Application.UseCases.Imports.GetImports;

// Returns every import row in the given MEI, after verifying the caller
// owns it.
public class GetImportsHandler
{
    private readonly IImportRepository _importRepository;
    private readonly IMeiRepository _meiRepository;

    public GetImportsHandler(
        IImportRepository importRepository,
        IMeiRepository meiRepository)
    {
        _importRepository = importRepository;
        _meiRepository = meiRepository;
    }

    public async Task<IReadOnlyList<ImportResult>> HandleAsync(
        GetImportsQuery query,
        CancellationToken cancellationToken = default)
    {
        // Step 1 — Parent MEI ownership.
        // Performed BEFORE the read so probing for someone else's MEI
        // returns 403, not an empty list (which would also leak the
        // fact that the id was reachable).
        var mei = await _meiRepository.GetByIdAsync(query.MeiId, cancellationToken);
        if (mei is null)
            throw new MeiNotFoundException(query.MeiId);
        if (mei.UserId != query.UserId)
            throw new UnauthorizedAccessException("You do not have access to this MEI.");

        // Step 2 — Read.
        var rows = await _importRepository.GetAllByMeiIdAsync(query.MeiId, cancellationToken);

        // Step 3 — Project. Wire-safe DTO via ImportResultMapper to keep
        // navigation properties (Mei -> User -> PasswordHash) off the
        // wire.
        return rows.Select(ImportResultMapper.ToResult).ToList();
    }
}
