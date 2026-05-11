using Core.Domain.Exceptions;
using Core.Domain.Interfaces;

namespace Core.Application.UseCases.Auth.ResetPassword;

// Handler for POST /v1/auth/reset-password.
//
// Validates the reset token, hashes the new password, and applies the
// change. The token is invalidated (IsUsed = true) on success so it
// cannot be redeemed twice — even within its 1-hour TTL.
public class ResetPasswordHandler
{
    private readonly IPasswordResetTokenRepository _tokenRepository;
    private readonly IUserRepository _userRepository;

    public ResetPasswordHandler(
        IPasswordResetTokenRepository tokenRepository,
        IUserRepository userRepository)
    {
        _tokenRepository = tokenRepository;
        _userRepository = userRepository;
    }

    public async Task HandleAsync(ResetPasswordCommand command, CancellationToken cancellationToken = default)
    {
        // Step 1 — Validate the token.
        // All three failure modes (unknown / used / expired) collapse
        // into the SAME exception so an attacker holding a captured
        // link cannot distinguish "never existed" from "was redeemed"
        // from "expired naturally". See InvalidResetTokenException for
        // the full rationale.
        var token = await _tokenRepository.GetByTokenAsync(command.Token, cancellationToken);
        if (token is null || token.IsUsed || token.ExpiresAt <= DateTime.UtcNow)
            throw new InvalidResetTokenException();

        // Step 2 — Materialize the user this token belongs to.
        // Defensive: if the user has been deleted but the token row
        // still exists (cascade misconfigured upstream), treat the
        // token as invalid — never set a password on a missing user.
        var user = await _userRepository.GetByIdAsync(token.UserId, cancellationToken);
        if (user is null)
            throw new InvalidResetTokenException();

        // Step 3 — Hash the new password with BCrypt.
        // BCrypt.HashPassword applies a unique salt internally and
        // returns a self-describing hash (algorithm + cost + salt +
        // digest), exactly matching what /v1/auth/login expects.
        // We never store plaintext, even transiently.
        user.PasswordHash = BCrypt.Net.BCrypt.HashPassword(command.NewPassword);
        user.UpdatedAt = DateTime.UtcNow;
        await _userRepository.UpdateAsync(user, cancellationToken);

        // Step 4 — Mark the token used. Order matters: if marking-used
        // were to fail AFTER updating the password, the user would
        // already have the new password and the worst-case is a
        // dangling token row — still bound by its 1-hour TTL. The
        // reverse ordering (mark-used first, then update password)
        // would risk a "burnt token, no password change" state if the
        // password write failed.
        await _tokenRepository.MarkAsUsedAsync(token.Id, cancellationToken);
    }
}
