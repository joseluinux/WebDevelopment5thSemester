namespace Core.Application.Interfaces;

// Abstraction the application layer uses to send transactional email.
//
// Why an interface (not a direct dependency on Resend in handlers):
//   1. The handler stays pure and unit-testable — no real network call is
//      made when the test suite swaps in a Moq.
//   2. The provider can be swapped (Mailgun, SES, SMTP, etc.) by writing
//      another implementation without touching any handler.
//   3. Core.Application stays free of Resend-specific types and packages.
//
// Methods are named after the *intent* (SendPasswordResetEmailAsync), not
// the transport (SendHtmlEmail). That lets the implementation own the
// subject/body template — handlers shouldn't be writing HTML by hand.
public interface IEmailService
{
    Task SendPasswordResetEmailAsync(
        string toEmail,
        string resetLink,
        CancellationToken cancellationToken = default);
}
