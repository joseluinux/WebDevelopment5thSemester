using Core.Domain.Interfaces;
using Core.Infrastructure;

namespace Core.Application.UseCases.Meis.CreateMei;

// Creates a new MEI owned by the authenticated user.
//
// Per-user duplicate-CNPJ check happens here at the application layer for
// nice error messages. The DB also enforces global CNPJ uniqueness via the
// `meis_cnpj_key` unique index (see AppDbContext) — that is the legal
// guarantee, since one CNPJ identifies one company globally; this in-app
// check is just the friendlier first line of defence.
public class CreateMeiHandler
{
    private readonly IMeiRepository _meiRepository;

    public CreateMeiHandler(IMeiRepository meiRepository)
    {
        _meiRepository = meiRepository;
    }

    public async Task<MeiResult> HandleAsync(CreateMeiCommand command, CancellationToken cancellationToken = default)
    {
        // One MEI per user: MEI is the fiscal identity of the entrepreneur,
        // so having more than one does not make business sense. Check before
        // any other validation to give the caller an early, clear error.
        var existingMeis = await _meiRepository.GetAllByUserIdAsync(command.UserId, cancellationToken);
        if (existingMeis.Any())
            throw new InvalidOperationException(
                "Each account can have only one MEI. Use the existing MEI or update its data.");

        // Per-user duplicate-CNPJ check: only meaningful if a CNPJ was supplied.
        // Note: existingMeis is already guaranteed empty at this point due to the
        // one-MEI-per-user check above. This block is kept as a belt-and-suspenders
        // guard in case the rule is relaxed later.
        if (!string.IsNullOrWhiteSpace(command.Cnpj))
        {
            if (existingMeis.Any(m => string.Equals(m.Cnpj, command.Cnpj, StringComparison.OrdinalIgnoreCase)))
            {
                // Re-using the standard InvalidOperationException keeps this
                // slice focused — if the duplicate-CNPJ rule grows
                // (different message, different status code), promote it to
                // a dedicated domain exception then.
                throw new InvalidOperationException(
                    $"A MEI with CNPJ '{command.Cnpj}' already exists for this user.");
            }
        }

        // Build the entity. Id is generated client-side (application layer)
        // rather than waiting on the DB default — this lets us return the
        // new id in the response without an extra round-trip.
        var mei = new Mei
        {
            Id = Guid.NewGuid(),
            UserId = command.UserId,
            Name = command.Name,
            Cnpj = command.Cnpj,
            Cnae = command.Cnae,
            AnnualLimit = command.AnnualLimit,
            Plan = command.Plan,
            CreatedAt = DateTime.UtcNow
        };

        await _meiRepository.AddAsync(mei, cancellationToken);

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
