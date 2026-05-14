using Core.Application.Interfaces;
using Core.Application.UseCases.Ai.GetAiContext;
using Core.Domain.Exceptions;

namespace Core.Application.UseCases.Ai.Chat;

// Orchestrates a single chat turn:
//   1. Validate MEI ownership.
//   2. Build the AI context snapshot via GetAiContextHandler.
//   3. Forward the message + context + history to the FastAPI agent.
//   4. Return the assistant reply.
//
// Delegating step 2 to GetAiContextHandler avoids duplicating the
// aggregation logic and keeps both callers in sync when the context
// shape changes.
public class ChatHandler
{
    private readonly GetAiContextHandler _getAiContextHandler;
    private readonly IFastApiService _fastApiService;

    public ChatHandler(
        GetAiContextHandler getAiContextHandler,
        IFastApiService fastApiService)
    {
        _getAiContextHandler = getAiContextHandler;
        _fastApiService = fastApiService;
    }

    public async Task<ChatResult> HandleAsync(
        ChatCommand command,
        CancellationToken cancellationToken = default)
    {
        // GetAiContextHandler already validates MEI existence and
        // ownership, so we don't need to repeat that check here.
        var context = await _getAiContextHandler.HandleAsync(
            new GetAiContextQuery(command.MeiId, command.UserId),
            cancellationToken);

        var response = await _fastApiService.ChatAsync(
            command.MeiId.ToString(),
            command.Message,
            command.History,
            context,
            cancellationToken);

        return new ChatResult(response.Reply);
    }
}
