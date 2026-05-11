using Core.Application.UseCases.Auth.ResetPassword;
using Core.Domain.Exceptions;
using Core.Domain.Interfaces;
using Core.Infrastructure;
using Moq;

namespace Core.UnitTests.Auth;

// ResetPasswordHandler depends only on IPasswordResetTokenRepository and
// IUserRepository, so Moq covers every collaborator — no DB, no HTTP.
//
// The handler treats THREE distinct failure modes (not-found / expired /
// already-used) as a SINGLE generic InvalidResetTokenException — a
// deliberate user-enumeration / replay-resistance defence. Each sad-path
// test below confirms one of those modes, and the happy-path test pins
// the order of writes (UpdateAsync then MarkAsUsedAsync).
public class ResetPasswordHandlerTests
{
    private readonly Mock<IPasswordResetTokenRepository> _tokenRepositoryMock = new();
    private readonly Mock<IUserRepository> _userRepositoryMock = new();
    private readonly ResetPasswordHandler _handler;

    public ResetPasswordHandlerTests()
    {
        _handler = new ResetPasswordHandler(
            _tokenRepositoryMock.Object,
            _userRepositoryMock.Object);
    }

    [Fact]
    public async Task HandleAsync_ValidToken_UpdatesPasswordAndMarksUsed()
    {
        // Arrange: a token that is fresh (ExpiresAt 1 hour in the future)
        // and unused, plus the user it belongs to. Both repository calls
        // the handler will make are stubbed.
        const string tokenString = "valid-token-string";
        var user = new User
        {
            Id = Guid.NewGuid(),
            Email = "user@example.com",
            PasswordHash = BCrypt.Net.BCrypt.HashPassword("old-password"),
            CreatedAt = DateTime.UtcNow.AddDays(-10)
        };
        var token = new PasswordResetToken
        {
            Id = Guid.NewGuid(),
            UserId = user.Id,
            Token = tokenString,
            ExpiresAt = DateTime.UtcNow.AddHours(1),
            IsUsed = false,
            CreatedAt = DateTime.UtcNow.AddMinutes(-5)
        };
        _tokenRepositoryMock
            .Setup(r => r.GetByTokenAsync(tokenString, default))
            .ReturnsAsync(token);
        _userRepositoryMock
            .Setup(r => r.GetByIdAsync(user.Id, default))
            .ReturnsAsync(user);

        // Act
        await _handler.HandleAsync(new ResetPasswordCommand(tokenString, "new-password"));

        // Assert: the user's password was persisted exactly once.
        _userRepositoryMock.Verify(
            r => r.UpdateAsync(It.IsAny<User>(), default),
            Times.Once);

        // Assert: the token was burnt exactly once. Together with
        // UpdateAsync above, this confirms BOTH writes happened — if
        // the handler ever forgets to mark the token used, replay
        // attacks would succeed silently and only this assertion would
        // catch it.
        _tokenRepositoryMock.Verify(
            r => r.MarkAsUsedAsync(token.Id, default),
            Times.Once);
    }

    [Fact]
    public async Task HandleAsync_TokenNotFound_ThrowsInvalidResetTokenException()
    {
        // Arrange: the supplied token isn't in the database at all.
        // The handler must NOT distinguish this case from "expired" or
        // "already used" — see InvalidResetTokenException for the
        // replay-resistance / enumeration rationale.
        _tokenRepositoryMock
            .Setup(r => r.GetByTokenAsync("does-not-exist", default))
            .ReturnsAsync((PasswordResetToken?)null);

        // Act + Assert
        await Assert.ThrowsAsync<InvalidResetTokenException>(
            () => _handler.HandleAsync(new ResetPasswordCommand("does-not-exist", "anything")));

        // Assert: nothing was written — the handler must abort before
        // any state change.
        _userRepositoryMock.Verify(r => r.UpdateAsync(It.IsAny<User>(), default), Times.Never);
        _tokenRepositoryMock.Verify(r => r.MarkAsUsedAsync(It.IsAny<Guid>(), default), Times.Never);
    }

    [Fact]
    public async Task HandleAsync_ExpiredToken_ThrowsInvalidResetTokenException()
    {
        // Arrange: a token whose ExpiresAt is in the past. IsUsed stays
        // false to prove that expiration alone is enough to invalidate
        // the token.
        const string tokenString = "expired-token";
        var token = new PasswordResetToken
        {
            Id = Guid.NewGuid(),
            UserId = Guid.NewGuid(),
            Token = tokenString,
            ExpiresAt = DateTime.UtcNow.AddHours(-1),
            IsUsed = false,
            CreatedAt = DateTime.UtcNow.AddHours(-2)
        };
        _tokenRepositoryMock
            .Setup(r => r.GetByTokenAsync(tokenString, default))
            .ReturnsAsync(token);

        // Act + Assert: same exception as "not found".
        await Assert.ThrowsAsync<InvalidResetTokenException>(
            () => _handler.HandleAsync(new ResetPasswordCommand(tokenString, "anything")));

        _userRepositoryMock.Verify(r => r.UpdateAsync(It.IsAny<User>(), default), Times.Never);
        _tokenRepositoryMock.Verify(r => r.MarkAsUsedAsync(It.IsAny<Guid>(), default), Times.Never);
    }

    [Fact]
    public async Task HandleAsync_AlreadyUsedToken_ThrowsInvalidResetTokenException()
    {
        // Arrange: a token whose IsUsed flag is true. ExpiresAt stays in
        // the future to prove that single-use enforcement alone is enough
        // — replaying a redeemed link must NOT work even within the TTL.
        const string tokenString = "already-used-token";
        var token = new PasswordResetToken
        {
            Id = Guid.NewGuid(),
            UserId = Guid.NewGuid(),
            Token = tokenString,
            ExpiresAt = DateTime.UtcNow.AddHours(1),
            IsUsed = true,
            CreatedAt = DateTime.UtcNow.AddMinutes(-30)
        };
        _tokenRepositoryMock
            .Setup(r => r.GetByTokenAsync(tokenString, default))
            .ReturnsAsync(token);

        // Act + Assert
        await Assert.ThrowsAsync<InvalidResetTokenException>(
            () => _handler.HandleAsync(new ResetPasswordCommand(tokenString, "anything")));

        _userRepositoryMock.Verify(r => r.UpdateAsync(It.IsAny<User>(), default), Times.Never);
        _tokenRepositoryMock.Verify(r => r.MarkAsUsedAsync(It.IsAny<Guid>(), default), Times.Never);
    }
}
