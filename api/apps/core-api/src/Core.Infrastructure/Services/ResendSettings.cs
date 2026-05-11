namespace Core.Infrastructure.Services;

// Plain POCO mirroring the "Resend" section of appsettings.json.
//
// ApiKey is consumed by the Resend SDK itself (via ResendClientOptions in
// the composition root); FromEmail is consumed here in
// ResendEmailService when composing outgoing messages.
public class ResendSettings
{
    public string ApiKey { get; set; } = string.Empty;
    public string FromEmail { get; set; } = string.Empty;
}
