using Core.Application.Auth;
using Core.Application.UseCases.Auth.Login;
using Core.Domain.Exceptions;
using Core.Domain.Interfaces;
using Core.Infrastructure;
using Moq;

namespace Core.UnitTests.Auth;

// LoginHandler is unit-testable because every collaborator is an abstraction:
//   - IUserRepository / IRefreshTokenRepository are mocked with Moq, so no
//     database is needed.
//   - JwtSettings is a plain POCO, so we just hand-build one with valid values.
public class LoginHandlerTests
{
    private readonly Mock<IUserRepository> _repositoryMock = new();
    private readonly Mock<IRefreshTokenRepository> _refreshTokenRepositoryMock = new();
    private readonly JwtSettings _jwtSettings = new()
    {
        // 32+ ASCII chars so the HMAC-SHA256 key meets the 256-bit minimum.
        Secret = "unit-test-secret-key-at-least-32-chars-long",
        Issuer = "LumeMEI.Tests",
        Audience = "LumeMEI.Tests.Clients",
        AccessTokenExpirationMinutes = 15,
        RefreshTokenExpirationDays = 30
    };

    private readonly LoginHandler _handler;

    public LoginHandlerTests()
    {
        _handler = new LoginHandler(
            _repositoryMock.Object,
            _refreshTokenRepositoryMock.Object,
            _jwtSettings);
    }

    [Fact]
    public async Task HandleAsync_ValidCredentials_ReturnsLoginResultWithAccessToken()
    {
        // Arrange: an existing user whose stored hash matches the password we will send.
        // BCrypt.HashPassword is called here (not in the handler) so the test owns the
        // hash and can assert deterministic behavior without depending on registration.
        const string email = "user@example.com";
        const string password = "CorrectHorseBatteryStaple!";
        var user = new User
        {
            Id = Guid.NewGuid(),
            Email = email,
            PasswordHash = BCrypt.Net.BCrypt.HashPassword(password)
        };

        _repositoryMock
            .Setup(r => r.GetByEmailAsync(email, default))
            .ReturnsAsync(user);

        // Act
        var result = await _handler.HandleAsync(new LoginCommand(email, password));

        // Assert: a JWT was issued and the expiration honours the configured window.
        Assert.False(string.IsNullOrWhiteSpace(result.AccessToken));
        Assert.False(string.IsNullOrWhiteSpace(result.RefreshToken));
        Assert.True(result.ExpiresAt > DateTime.UtcNow);

        // Assert: the refresh token was persisted exactly once (login MUST
        // record it before responding, otherwise /refresh would never find it).
        _refreshTokenRepositoryMock.Verify(
            r => r.AddAsync(It.IsAny<RefreshToken>(), default),
            Times.Once);
    }

    [Fact]
    public async Task HandleAsync_UserNotFound_ThrowsInvalidCredentialsException()
    {
        // Arrange: repository returns null -> no user with that email.
        _repositoryMock
            .Setup(r => r.GetByEmailAsync("ghost@example.com", default))
            .ReturnsAsync((User?)null);

        // Act + Assert: handler must throw the SAME generic exception used for
        // wrong-password — that is the user-enumeration defense we care about.
        await Assert.ThrowsAsync<InvalidCredentialsException>(
            () => _handler.HandleAsync(new LoginCommand("ghost@example.com", "anything")));
    }

    [Fact]
    public async Task HandleAsync_WrongPassword_ThrowsInvalidCredentialsException()
    {
        // Arrange: the user exists, but the stored hash will not match the password we send.
        const string email = "user@example.com";
        var user = new User
        {
            Id = Guid.NewGuid(),
            Email = email,
            PasswordHash = BCrypt.Net.BCrypt.HashPassword("the-real-password")
        };

        _repositoryMock
            .Setup(r => r.GetByEmailAsync(email, default))
            .ReturnsAsync(user);

        // Act + Assert: same exception type as user-not-found — confirming the handler
        // never differentiates the two failure modes to the caller.
        await Assert.ThrowsAsync<InvalidCredentialsException>(
            () => _handler.HandleAsync(new LoginCommand(email, "wrong-password")));
    }
}
