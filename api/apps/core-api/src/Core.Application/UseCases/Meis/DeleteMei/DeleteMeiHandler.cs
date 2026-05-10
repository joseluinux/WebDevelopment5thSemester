using Core.Domain.Exceptions;
using Core.Domain.Interfaces;

namespace Core.Application.UseCases.Meis.DeleteMei;

// Hard-deletes a MEI after verifying that it exists and belongs to the
// authenticated user.
public class DeleteMeiHandler
{
    private readonly IMeiRepository _meiRepository;

    public DeleteMeiHandler(IMeiRepository meiRepository)
    {
        _meiRepository = meiRepository;
    }

    public async Task HandleAsync(DeleteMeiCommand command, CancellationToken cancellationToken = default)
    {
        var mei = await _meiRepository.GetByIdAsync(command.MeiId, cancellationToken);

        if (mei is null)
            throw new MeiNotFoundException(command.MeiId);

        // Security: ownership check before any destructive action. Without
        // this branch a request that knew (or guessed) someone else's MeiId
        // could nuke their MEI and every dependent row (cascade FKs in
        // AppDbContext: transactions, products, employees, ...). This is the
        // single most dangerous operation in the controller — keeping the
        // check explicit here means a future refactor can't accidentally drop
        // it without also deleting the whole `if` branch.
        if (mei.UserId != command.UserId)
            throw new UnauthorizedAccessException("You do not have access to this MEI.");

        await _meiRepository.DeleteAsync(mei.Id, cancellationToken);
    }
}
