using Core.Domain.Exceptions;
using Core.Domain.Interfaces;

namespace Core.Application.UseCases.Meis.UpdateMei;

// Updates the editable fields of a MEI.
//
// Like GetMeiHandler, this handler enforces ownership BEFORE any mutation —
// a missing ownership check would let any authenticated user rename or
// re-plan another tenant's MEI.
public class UpdateMeiHandler
{
    private readonly IMeiRepository _meiRepository;

    public UpdateMeiHandler(IMeiRepository meiRepository)
    {
        _meiRepository = meiRepository;
    }

    public async Task<MeiResult> HandleAsync(UpdateMeiCommand command, CancellationToken cancellationToken = default)
    {
        var mei = await _meiRepository.GetByIdAsync(command.MeiId, cancellationToken);

        if (mei is null)
            throw new MeiNotFoundException(command.MeiId);

        // Security: same multi-tenant boundary as GetMeiHandler. Reject
        // BEFORE applying any change so a forged MeiId never causes a write
        // against another user's row.
        if (mei.UserId != command.UserId)
            throw new UnauthorizedAccessException("You do not have access to this MEI.");

        // Apply only the fields the command exposes. UserId, Cnpj, CreatedAt
        // are intentionally NOT touched here — they are not part of the
        // editable surface (see UpdateMeiCommand).
        mei.Name = command.Name;
        mei.Cnae = command.Cnae;
        mei.AnnualLimit = command.AnnualLimit;
        mei.Plan = command.Plan;
        mei.UpdatedAt = DateTime.UtcNow;

        await _meiRepository.UpdateAsync(mei, cancellationToken);

        return new MeiResult(
            mei.Id,
            mei.Name,
            mei.Cnpj,
            mei.Cnae,
            mei.AnnualLimit,
            mei.Plan,
            mei.CreatedAt,
            mei.UpdatedAt);
    }
}
