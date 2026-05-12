namespace Core.Infrastructure.Services;

// Strongly-typed binding for the "SupabaseStorage" section of
// appsettings.json. Bound in Program.cs and surfaced directly in the
// DI container — same convention as JwtSettings / ResendSettings.
//
// The service-role key is a SECRET. Never expose it to clients, never
// log it, and never echo it in error messages. It bypasses Row Level
// Security and gives full read/write to every bucket in the project,
// so the only safe place for it is server-side configuration.
public class SupabaseStorageSettings
{
    // Project URL, without trailing slash. The Storage REST API lives
    // under "{Url}/storage/v1/...".
    // Example: "https://abcdefgh.supabase.co".
    public string Url { get; set; } = string.Empty;

    // Service-role API key. See class summary for the security warning.
    public string ServiceRoleKey { get; set; } = string.Empty;
}
