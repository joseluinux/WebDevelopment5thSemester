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
        // Per-user duplicate-CNPJ check: only meaningful if a CNPJ was supplied.
        // Cnpj is nullable on the entity, so accepting null here matches the
        // spec ("MEIs may be created without a CNPJ and have it filled in
        // later").
        if (!string.IsNullOrWhiteSpace(command.Cnpj))
        {
            var existing = await _meiRepository.GetAllByUserIdAsync(command.UserId, cancellationToken);
            if (existing.Any(m => string.Equals(m.Cnpj, command.Cnpj, StringComparison.OrdinalIgnoreCase)))
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
