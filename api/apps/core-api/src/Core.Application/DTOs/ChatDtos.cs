using System.Text.Json.Serialization;

namespace Core.Application.DTOs;

// DTOs for the Python FastAPI chat endpoint.
// snake_case JsonPropertyName attributes ensure the request body is
// serialised in the shape FastAPI expects without configuring a global
// naming policy on the HttpClient.

public record ChatHistoryItemDto(
    [property: JsonPropertyName("role")] string Role,
    [property: JsonPropertyName("content")] string Content);

public record ChatResponseDto(
    [property: JsonPropertyName("reply")] string Reply,
    [property: JsonPropertyName("mei_id")] string MeiId);
