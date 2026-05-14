using System.Net.Http.Json;
using Core.Application.DTOs;
using Core.Application.Interfaces;
using Core.Application.UseCases.Ai.GetAiContext;

namespace Core.Infrastructure.Services;

// HTTP implementation of IFastApiService. Wraps a typed HttpClient
// (registered via AddHttpClient<IFastApiService, FastApiService>) so
// IHttpClientFactory manages the underlying HttpMessageHandler lifecycle
// — the recommended pattern in ASP.NET Core to avoid socket exhaustion.
public class FastApiService : IFastApiService
{
    private readonly HttpClient _httpClient;
    private readonly FastApiSettings _settings;

    public FastApiService(HttpClient httpClient, FastApiSettings settings)
    {
        _httpClient = httpClient;
        _settings = settings;
    }

    public async Task<ImportResponse> ProcessImportAsync(
        string importId,
        string meiId,
        string fileUrl,
        CancellationToken cancellationToken = default)
    {
        // Build the request body in the exact shape FastAPI expects
        // (snake_case keys). Anonymous object + System.Text.Json keeps
        // the call site readable and avoids inventing a request DTO
        // for a single field-shape that is unlikely to ever change.
        var body = new
        {
            import_id = importId,
            mei_id = meiId,
            file_url = fileUrl
        };

        // Compose the absolute URL from settings. We don't rely on
        // HttpClient.BaseAddress because settings could legitimately
        // contain the full URL, and string concatenation makes that
        // case obvious in code review.
        var requestUrl = $"{_settings.BaseUrl.TrimEnd('/')}{_settings.ImportEndpoint}";

        // PostAsJsonAsync handles serialisation + Content-Type. Any
        // network failure or non-2xx status surfaces as an exception
        // here, which CreateImportHandler catches and translates into
        // an "error" Import row.
        using var httpResponse = await _httpClient.PostAsJsonAsync(
            requestUrl, body, cancellationToken);

        // EnsureSuccessStatusCode throws HttpRequestException with the
        // status code embedded — good enough for the handler's
        // "transport error" branch, no extra parsing needed.
        httpResponse.EnsureSuccessStatusCode();

        // Deserialize the body. A null result here means FastAPI
        // returned an empty/malformed payload despite the 2xx — treat
        // as a hard failure so the caller can surface "error" instead
        // of pretending nothing went wrong.
        var parsed = await httpResponse.Content.ReadFromJsonAsync<ImportResponse>(
            cancellationToken: cancellationToken);

        if (parsed is null)
            throw new InvalidOperationException(
                "FastAPI returned a 2xx response with an empty or unparsable body.");

        return parsed;
    }

    public async Task<ChatResponseDto> ChatAsync(
        string meiId,
        string message,
        IReadOnlyList<ChatHistoryItemDto> history,
        GetAiContextResult context,
        CancellationToken cancellationToken = default)
    {
        // Build a request body with explicit snake_case keys that match
        // the FastAPI ChatRequest Pydantic model exactly. Using an
        // anonymous object here avoids adding a request DTO that would
        // only ever be used in this one call site.
        var body = new
        {
            mei_id = meiId,
            message,
            history = history.Select(h => new { role = h.Role, content = h.Content }).ToArray(),
            context = new
            {
                mei_name = context.MeiName,
                plan = context.Plan,
                annual_limit = context.AnnualLimit,
                total_income = context.TotalIncome,
                total_expense = context.TotalExpense,
                net_profit = context.NetProfit,
                transaction_count = context.TransactionCount,
                product_count = context.ProductCount,
                employee_count = context.EmployeeCount,
                top_categories = context.TopCategories,
                recent_transactions = context.RecentTransactions.Select(t => new
                {
                    type = t.Type,
                    category = t.Category,
                    amount = t.Amount,
                    date = t.Date.ToString("yyyy-MM-dd"),
                    description = t.Description,
                }).ToArray()
            }
        };

        var requestUrl = $"{_settings.BaseUrl.TrimEnd('/')}{_settings.ChatEndpoint}";

        using var httpResponse = await _httpClient.PostAsJsonAsync(
            requestUrl, body, cancellationToken);

        httpResponse.EnsureSuccessStatusCode();

        var parsed = await httpResponse.Content.ReadFromJsonAsync<ChatResponseDto>(
            cancellationToken: cancellationToken);

        if (parsed is null)
            throw new InvalidOperationException(
                "FastAPI returned a 2xx chat response with an empty or unparsable body.");

        return parsed;
    }
}
