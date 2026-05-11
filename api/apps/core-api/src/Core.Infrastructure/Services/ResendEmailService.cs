using Core.Application.Interfaces;
using Resend;

namespace Core.Infrastructure.Services;

// Resend implementation of IEmailService.
//
// Why this lives in Core.Infrastructure:
//   - It directly references the Resend SDK (a third-party HTTP client).
//   - Core.Application must remain transport-agnostic.
//
// The HTML body template lives here, not in the handler — handlers should
// not be in the business of rendering email markup, and centralising the
// template makes it easy to update branding/copy without touching any
// use-case code.
public class ResendEmailService : IEmailService
{
    private readonly IResend _resend;
    private readonly ResendSettings _settings;

    public ResendEmailService(IResend resend, ResendSettings settings)
    {
        _resend = resend;
        _settings = settings;
    }

    public async Task SendPasswordResetEmailAsync(
        string toEmail,
        string resetLink,
        CancellationToken cancellationToken = default)
    {
        // Build the Resend EmailMessage. Both `From` and `To` use the
        // SDK's implicit string -> EmailAddress conversion (see Resend.dll
        // EmailAddress.op_Implicit) so we don't have to construct address
        // objects manually.
        var message = new EmailMessage
        {
            From = _settings.FromEmail,
            To = toEmail,
            Subject = "Redefinição de senha — LumeMEI",
            HtmlBody = BuildHtmlBody(resetLink),
            TextBody = BuildTextBody(resetLink)
        };

        // Note: if the API key is invalid or the domain isn't verified,
        // Resend will throw / return an error response. We intentionally
        // do NOT catch here — the forgot-password handler decides what to
        // do (currently lets the exception bubble; the controller's catch
        // surfaces it as 500). A future iteration may want to log and
        // swallow, since silently failing to send the email is preferable
        // to leaking errors to the caller (who already gets 200 OK by
        // design).
        await _resend.EmailSendAsync(message, cancellationToken);
    }

    // Minimal, accessible HTML. Inline styles only — most email clients
    // strip or ignore <style> blocks. Portuguese copy per spec; mirrors
    // the user-facing language of the product.
    private static string BuildHtmlBody(string resetLink)
    {
        // The link itself is repeated as plain text below the button so
        // clients that block link auto-styling (or strip the button) still
        // give the user a usable URL to copy.
        return $@"<!DOCTYPE html>
<html lang=""pt-BR"">
<head>
  <meta charset=""utf-8"" />
  <meta name=""viewport"" content=""width=device-width, initial-scale=1.0"" />
  <title>Redefinição de senha</title>
</head>
<body style=""margin:0; padding:0; background-color:#f5f7fb; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color:#1a1a1a;"">
  <table role=""presentation"" width=""100%"" cellpadding=""0"" cellspacing=""0"" style=""background-color:#f5f7fb; padding:32px 0;"">
    <tr>
      <td align=""center"">
        <table role=""presentation"" width=""560"" cellpadding=""0"" cellspacing=""0"" style=""background:#ffffff; border-radius:12px; padding:40px; box-shadow: 0 2px 8px rgba(0,0,0,0.04);"">
          <tr>
            <td>
              <h1 style=""margin:0 0 16px; font-size:22px; color:#1a1a1a;"">Redefinição de senha</h1>
              <p style=""margin:0 0 16px; font-size:15px; line-height:1.55; color:#333;"">
                Olá! Recebemos um pedido para redefinir a senha da sua conta na <strong>LumeMEI</strong>.
              </p>
              <p style=""margin:0 0 24px; font-size:15px; line-height:1.55; color:#333;"">
                Clique no botão abaixo para escolher uma nova senha. Este link é válido por <strong>1 hora</strong> e só pode ser usado uma vez.
              </p>
              <table role=""presentation"" cellpadding=""0"" cellspacing=""0"">
                <tr>
                  <td align=""center"" style=""border-radius:8px; background:#2563eb;"">
                    <a href=""{resetLink}""
                       style=""display:inline-block; padding:14px 28px; font-size:15px; font-weight:600; color:#ffffff; text-decoration:none; border-radius:8px;"">
                      Redefinir minha senha
                    </a>
                  </td>
                </tr>
              </table>
              <p style=""margin:24px 0 8px; font-size:13px; color:#666;"">
                Se o botão não funcionar, copie e cole este link no seu navegador:
              </p>
              <p style=""margin:0 0 24px; font-size:13px; word-break:break-all;"">
                <a href=""{resetLink}"" style=""color:#2563eb;"">{resetLink}</a>
              </p>
              <hr style=""border:none; border-top:1px solid #eee; margin:24px 0;"" />
              <p style=""margin:0; font-size:12px; color:#888; line-height:1.5;"">
                Se você não solicitou essa alteração, ignore este e-mail — sua senha permanecerá a mesma.
              </p>
            </td>
          </tr>
        </table>
        <p style=""margin:16px 0 0; font-size:12px; color:#999;"">© LumeMEI</p>
      </td>
    </tr>
  </table>
</body>
</html>";
    }

    // Text fallback for clients that won't render HTML. Same content,
    // stripped of markup.
    private static string BuildTextBody(string resetLink)
    {
        return $@"Redefinição de senha — LumeMEI

Recebemos um pedido para redefinir a senha da sua conta.

Acesse o link abaixo para escolher uma nova senha. O link é válido por 1 hora e só pode ser usado uma vez:

{resetLink}

Se você não solicitou essa alteração, ignore este e-mail — sua senha permanecerá a mesma.

— LumeMEI";
    }
}
