using Core.Domain.Exceptions;
using Core.Domain.Interfaces;

namespace Core.Application.UseCases.Meis.GetMei;

// Returns a single MEI, with the security check that the row belongs to the
// authenticated user.
public class GetMeiHandler
{
    private readonly IMeiRepository _meiRepository;

    public GetMeiHandler(IMeiRepository meiRepository)
    {
        _meiRepository = meiRepository;
    }

    public async Task<MeiResult> HandleAsync(GetMeiQuery query, CancellationToken cancellationToken = default)
    {
        var mei = await _meiRepository.GetByIdAsync(query.MeiId, cancellationToken);

        // Step 1 — Existence check.
        if (mei is null)
            throw new MeiNotFoundException(query.MeiId);

        // Step 2 — Ownership check.
        // Security: this is the multi-tenant boundary. Without this branch a
        // user could read any MEI in the database simply by guessing or
        // probing Guid values. Throwing UnauthorizedAccessException (mapped
        // to 403 by the controller) — instead of MeiNotFoundException —
        // makes ownership violations distinct from genuine misses for our
        // own logs and dashboards. We accept the small information leak
        // (an attacker learns the Guid corresponds to *some* row) because
        // Guids are not enumerable.
        if (mei.UserId != query.UserId)
            throw new UnauthorizedAccessException("You do not have access to this MEI.");

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
