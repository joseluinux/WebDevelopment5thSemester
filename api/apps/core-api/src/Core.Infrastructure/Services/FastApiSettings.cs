namespace Core.Infrastructure.Services;

// Strongly-typed binding for the "FastApi" section of appsettings.json.
//
// Bound in Program.cs and surfaced directly in the DI container so the
// FastApiService can take a plain settings object without coupling to
// Microsoft.Extensions.Options at the call site — same convention as
// JwtSettings / ResendSettings.
public class FastApiSettings
{
    // Base URL of the FastAPI service, without a trailing slash.
    // Example: "http://localhost:8000".
    public string BaseUrl { get; set; } = string.Empty;

    // Path of the import-processing endpoint. Kept separate from
    // BaseUrl so future endpoints (re-classify, dry-run) can live
    // alongside without duplicating the host.
    public string ImportEndpoint { get; set; } = string.Empty;
}
