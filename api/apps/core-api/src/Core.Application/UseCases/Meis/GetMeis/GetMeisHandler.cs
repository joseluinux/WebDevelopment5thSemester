using Core.Domain.Interfaces;

namespace Core.Application.UseCases.Meis.GetMeis;

// Returns every MEI owned by the authenticated user.
//
// The repository call is already filtered by user id, so multi-tenant
// isolation happens at the SQL level — there is no risk of accidentally
// projecting another user's row through code paths in this handler.
public class GetMeisHandler
{
    private readonly IMeiRepository _meiRepository;

    public GetMeisHandler(IMeiRepository meiRepository)
    {
        _meiRepository = meiRepository;
    }

    public async Task<IReadOnlyList<MeiResult>> HandleAsync(GetMeisQuery query, CancellationToken cancellationToken = default)
    {
        var meis = await _meiRepository.GetAllByUserIdAsync(query.UserId, cancellationToken);

        // Project each entity to the safe DTO. Doing this inside the
        // application layer means controllers never touch the entity, and the
        // PasswordHash-leak class of bug stays impossible.
        return meis
            .Select(m => new MeiResult(
                m.Id,
                m.Name,
                m.Cnpj,
                m.Cnae,
                m.AnnualLimit,
                m.Plan,
                m.CreatedAt,
                m.UpdatedAt))
            .ToList();
    }
}
