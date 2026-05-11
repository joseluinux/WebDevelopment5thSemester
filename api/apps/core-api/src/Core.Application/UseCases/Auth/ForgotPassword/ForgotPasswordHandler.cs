using System.Security.Cryptography;
using Core.Application.Interfaces;
using Core.Domain.Interfaces;
using Core.Infrastructure;

namespace Core.Application.UseCases.Auth.ForgotPassword;

// Handler for POST /v1/auth/forgot-password.
//
// IMPORTANT SECURITY INVARIANT: this handler returns success regardless of
// whether the supplied email exists. Returning a distinct response for
// "unknown email" would let an attacker harvest valid user emails by
// flooding the endpoint — exactly the user-enumeration attack we defend
// against everywhere else in the auth surface. From the caller's
// perspective, "200 OK" simply means "if that email maps to an account,
// a reset link is on its way".
public class ForgotPasswordHandler
{
    // Fixed token lifetime. 1 hour is the spec — short enough to limit
    // the value of a leaked email, long enough that a real user can
    // realistically complete the flow.
    private static readonly TimeSpan TokenLifetime = TimeSpan.FromHours(1);

    // Reset link host. Hard-coded here per the slice spec; if this ever
    // needs to be environment-specific, move to configuration.
    private const string ResetLinkBase = "https://lumemei.com.br/reset-password?token=";

    private readonly IUserRepository _userRepository;
    private readonly IPasswordResetTokenRepository _tokenRepository;
    private readonly IEmailService _emailService;

    public ForgotPasswordHandler(
        IUserRepository userRepository,
        IPasswordResetTokenRepository tokenRepository,
        IEmailService emailService)
    {
        _userRepository = userRepository;
        _tokenRepository = tokenRepository;
        _emailService = emailService;
    }

    public async Task HandleAsync(ForgotPasswordCommand command, CancellationToken cancellationToken = default)
    {
        // Step 1 — Look up the user.
        var user = await _userRepository.GetByEmailAsync(command.Email, cancellationToken);

        // Step 2 — Silent return on unknown email.
        // Security: NEVER reveal whether an email is registered. The
        // controller treats a thrown exception as 500, so falling out
        // here with no work done produces the "200 OK" the controller
        // wants. Crucially, we also don't even hit the email service —
        // we don't want to leak existence through timing differences if
        // we can help it. (Determined attackers can still measure timing
        // — that's a separate, deeper mitigation.)
        if (user is null)
            return;

        // Step 3 — Mint an opaque high-entropy token.
        // 64 bytes -> 512 bits, base64-encoded. CSPRNG is mandatory —
        // System.Random is predictable and would let an attacker who
        // sees one token guess the next ones.
        var tokenString = GenerateToken();

        // Step 4 — Persist BEFORE sending the email. If the email send
        // succeeds but the DB insert fails, the user has a link in their
        // inbox that the server doesn't recognise — confusing. The
        // reverse ordering (persist first) means at worst the user gets
        // no email but the row exists; another forgot-password call
        // simply produces a new one.
        var resetToken = new PasswordResetToken
        {
            Id = Guid.NewGuid(),
            UserId = user.Id,
            Token = tokenString,
            ExpiresAt = DateTime.UtcNow.Add(TokenLifetime),
            IsUsed = false,
            CreatedAt = DateTime.UtcNow
        };
        await _tokenRepository.AddAsync(resetToken, cancellationToken);

        // Step 5 — Send the email.
        var resetLink = ResetLinkBase + tokenString;
        await _emailService.SendPasswordResetEmailAsync(user.Email, resetLink, cancellationToken);
    }

    private static string GenerateToken()
    {
        var bytes = new byte[64];
        RandomNumberGenerator.Fill(bytes);
        return Convert.ToBase64String(bytes);
    }
}
