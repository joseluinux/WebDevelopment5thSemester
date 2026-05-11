using Core.Application.Interfaces;
using Core.Application.UseCases.Auth.ForgotPassword;
using Core.Domain.Interfaces;
using Core.Infrastructure;
using Moq;

namespace Core.UnitTests.Auth;

// ForgotPasswordHandler depends only on abstractions (IUserRepository,
// IPasswordResetTokenRepository, IEmailService), so Moq is enough — no
// database, no SMTP server, no HTTP pipeline is exercised in these tests.
public class ForgotPasswordHandlerTests
{
    private readonly Mock<IUserRepository> _userRepositoryMock = new();
    private readonly Mock<IPasswordResetTokenRepository> _tokenRepositoryMock = new();
    private readonly Mock<IEmailService> _emailServiceMock = new();
    private readonly ForgotPasswordHandler _handler;

    public ForgotPasswordHandlerTests()
    {
        _handler = new ForgotPasswordHandler(
            _userRepositoryMock.Object,
            _tokenRepositoryMock.Object,
            _emailServiceMock.Object);
    }

    [Fact]
    public async Task HandleAsync_ValidEmail_PersistsTokenAndSendsEmail()
    {
        // Arrange: a registered user exists for the supplied email.
        const string email = "user@example.com";
        var user = new User
        {
            Id = Guid.NewGuid(),
            Email = email,
            PasswordHash = "irrelevant-for-forgot",
            CreatedAt = DateTime.UtcNow.AddDays(-1)
        };
        _userRepositoryMock
            .Setup(r => r.GetByEmailAsync(email, default))
            .ReturnsAsync(user);

        // Act
        await _handler.HandleAsync(new ForgotPasswordCommand(email));

        // Assert: the handler persisted exactly one PasswordResetToken
        // (the row used to validate the reset link later).
        _tokenRepositoryMock.Verify(
            r => r.AddAsync(It.IsAny<PasswordResetToken>(), default),
            Times.Once);

        // Assert: the handler asked the email service to send exactly one
        // message to this user. We don't bother checking the reset-link
        // string itself — the token value is randomly generated inside
        // the handler, so asserting on its exact contents would couple
        // the test to the CSPRNG output.
        _emailServiceMock.Verify(
            s => s.SendPasswordResetEmailAsync(user.Email, It.IsAny<string>(), default),
            Times.Once);
    }

    [Fact]
    public async Task HandleAsync_UnknownEmail_ReturnsSilentlyWithoutSideEffects()
    {
        // Arrange: repository returns null -> the supplied email is not
        // registered. This is the critical user-enumeration defence: an
        // attacker probing for valid emails must observe IDENTICAL behaviour
        // for "registered" and "unregistered" cases. From the test's
        // perspective, that means:
        //   1. No exception is thrown (the controller still returns 200).
        //   2. No token row is written (would create an orphan).
        //   3. No email is sent (would leak existence via timing / inbox).
        const string unknownEmail = "ghost@example.invalid";
        _userRepositoryMock
            .Setup(r => r.GetByEmailAsync(unknownEmail, default))
            .ReturnsAsync((User?)null);

        // Act: must complete normally — no exception.
        await _handler.HandleAsync(new ForgotPasswordCommand(unknownEmail));

        // Assert: nothing was persisted.
        _tokenRepositoryMock.Verify(
            r => r.AddAsync(It.IsAny<PasswordResetToken>(), default),
            Times.Never);

        // Assert: nothing was sent.
        _emailServiceMock.Verify(
            s => s.SendPasswordResetEmailAsync(It.IsAny<string>(), It.IsAny<string>(), default),
            Times.Never);
    }
}
