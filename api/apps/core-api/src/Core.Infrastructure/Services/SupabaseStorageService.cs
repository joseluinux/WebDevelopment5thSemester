using System.Net.Http.Headers;
using Core.Application.Interfaces;

namespace Core.Infrastructure.Services;

// HTTP implementation of IStorageService backed by the Supabase Storage
// REST API. Talks to:
//   POST {Url}/storage/v1/object/{bucket}/{key}
// with Authorization: Bearer {service-role-key}.
//
// We do not use the supabase-csharp NuGet package — the surface we
// need is two HTTP calls' worth and the package would pull in a much
// larger dependency tree for no functional gain. Wrapping a typed
// HttpClient via IHttpClientFactory is the conventional ASP.NET Core
// shape and matches FastApiService.
public class SupabaseStorageService : IStorageService
{
    private readonly HttpClient _httpClient;
    private readonly SupabaseStorageSettings _settings;

    public SupabaseStorageService(HttpClient httpClient, SupabaseStorageSettings settings)
    {
        _httpClient = httpClient;
        _settings = settings;
    }

    public async Task<string> UploadFileAsync(
        string bucketName,
        string fileName,
        Stream fileStream,
        string contentType,
        CancellationToken cancellationToken = default)
    {
        // URL-encode each path segment individually so that legitimate
        // characters in file names (spaces, accents, parentheses) are
        // escaped without also encoding the path separators.
        var encodedKey = string.Join('/',
            fileName.Split('/').Select(Uri.EscapeDataString));
        var encodedBucket = Uri.EscapeDataString(bucketName);

        var baseUrl = _settings.Url.TrimEnd('/');
        var uploadUrl = $"{baseUrl}/storage/v1/object/{encodedBucket}/{encodedKey}";

        // StreamContent reads the stream once and uploads it without
        // buffering the whole file into memory — important for the 10MB
        // ceiling we allow at the controller boundary.
        using var content = new StreamContent(fileStream);
        if (!string.IsNullOrWhiteSpace(contentType))
            content.Headers.ContentType = new MediaTypeHeaderValue(contentType);

        using var request = new HttpRequestMessage(HttpMethod.Post, uploadUrl)
        {
            Content = content
        };

        // Auth: bearer + apikey. Supabase accepts either header alone
        // for service-role calls, but both are sent so the request also
        // works against gateways that only accept one of them.
        request.Headers.Authorization = new AuthenticationHeaderValue(
            "Bearer", _settings.ServiceRoleKey);
        request.Headers.Add("apikey", _settings.ServiceRoleKey);

        // x-upsert: "true" tells Storage to overwrite if the key already
        // exists. We never reuse keys (the handler prefixes a fresh
        // GUID) so this is belt-and-braces against retries.
        request.Headers.Add("x-upsert", "true");

        using var response = await _httpClient.SendAsync(request, cancellationToken);

        if (!response.IsSuccessStatusCode)
        {
            // Read the body so the exception carries Supabase's own
            // error message (e.g. "Bucket not found", "new row violates
            // row-level security policy"). This is what makes a
            // 4xx/5xx in dev actually debuggable.
            var error = await response.Content.ReadAsStringAsync(cancellationToken);
            throw new HttpRequestException(
                $"Supabase upload failed: {(int)response.StatusCode} {response.ReasonPhrase}. Body: {error}");
        }

        // Build the public URL deterministically. This requires the
        // bucket to be configured as public in Supabase. If you switch
        // to a private bucket, swap this for a signed-URL request to
        //   POST /storage/v1/object/sign/{bucket}/{key}
        // and return the resulting "signedURL".
        return $"{baseUrl}/storage/v1/object/public/{encodedBucket}/{encodedKey}";
    }
}
