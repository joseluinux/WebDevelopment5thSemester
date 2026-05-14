using Core.Application.DTOs;

namespace Core.Application.UseCases.Ai.Chat;

public record ChatCommand(
    Guid MeiId,
    Guid UserId,
    string Message,
    IReadOnlyList<ChatHistoryItemDto> History);
