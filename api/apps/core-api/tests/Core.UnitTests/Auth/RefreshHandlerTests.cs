using Core.Application.Auth;
using Core.Application.UseCases.Auth.Refresh;
using Core.Domain.Exceptions;
using Core.Domain.Interfaces;
using Core.Infrastructure;
using Moq;

namespace Core.UnitTests.Auth;

// RefreshHandler depends only on abstractions, so Moq + a hand-built
// JwtSettings give us full coverage without a database or HTTP pipeline.
public class RefreshHandlerTests
{
    private readonly Mock<IRefreshTokenRepository> _refreshTokenRepositoryMock = new();
    private readonly Mock<IUserRepository> _userRepositoryMock = new();
    private readonly JwtSettings _jwtSettings = new()
    {
        Secret = "unit-test-secret-key-at-least-32-chars-long",
        Issuer = "LumeMEI.Tests",
        Audience = "LumeMEI.Tests.Clients",
        AccessTokenExpirationMinutes = 15,
        RefreshTokenExpirationDays = 30
    };

    private readonly RefreshHandler _handler;

    public RefreshHandlerTests()
    {
        _handler = new RefreshHandler(
            _refreshTokenRepositoryMock.Object,
            _userRepositoryMock.Object,
            _jwtSettings);
    }

    [Fact]
    public async Task HandleAsync_ValidRefreshToken_ReturnsNewPairAndRotatesOldToken()
    {
        // Arrange: a still-valid refresh token row, and the user that owns it.
        const string oldTokenString = "valid-token-string";
        var user = new User
        {
            Id = Guid.NewGuid(),
            Email = "user@example.com",
            PasswordHash = "irrelevant-for-refresh"
        };
        var existing = new RefreshToken
        {
            Id = Guid.NewGuid(),
            UserId = user.Id,
            Token = oldTokenString,
            ExpiresAt = DateTime.UtcNow.AddDays(7),
            IsRevoked = false,
            CreatedAt = DateTime.UtcNow.AddDays(-1)
        };

        _refreshTokenRepositoryMock
            .Setup(r => r.GetByTokenAsync(oldTokenString, default))
            .ReturnsAsync(existing);
        _userRepositoryMock
            .Setup(r => r.GetByIdAsync(user.Id, default))
            .ReturnsAsync(user);

        // Act
        var result = await _handler.HandleAsync(new RefreshCommand(oldTokenString));

        // Assert: a brand-new access token was minted.
        Assert.False(string.IsNullOrWhiteSpace(result.AccessToken));
        // Assert: rotation happened — the new refresh-token string is NOT the
        // old one. (CreateRefreshToken is CSPRNG output, so collisions are a
        // non-event in practice.)
        Assert.False(string.IsNullOrWhiteSpace(result.RefreshToken));
        Assert.NotEqual(oldTokenString, result.RefreshToken);
        Assert.True(result.ExpiresAt > DateTime.UtcNow);

        // Assert: rotation was actually persisted — old revoked, new added.
        _refreshTokenRepositoryMock.Verify(r => r.RevokeAsync(existing, default), Times.Once);
        _refreshTokenRepositoryMock.Verify(r => r.AddAsync(It.IsAny<RefreshToken>(), default), Times.Once);
    }

    [Fact]
    public async Task HandleAsync_ExpiredToken_ThrowsInvalidRefreshTokenException()
    {
        // Arrange: a token whose ExpiresAt is in the past. IsRevoked stays
        // false to prove that expiration alone is enough to fail validation.
        const string token = "expired-token";
        var existing = new RefreshToken
        {
            Id = Guid.NewGuid(),
            UserId = Guid.NewGuid(),
            Token = token,
            ExpiresAt = DateTime.UtcNow.AddSeconds(-1),
            IsRevoked = false,
            CreatedAt = DateTime.UtcNow.AddDays(-31)
        };
        _refreshTokenRepositoryMock
            .Setup(r => r.GetByTokenAsync(token, default))
            .ReturnsAsync(existing);

        // Act + Assert: same generic exception as every other failure mode.
        await Assert.ThrowsAsync<InvalidRefreshTokenException>(
            () => _handler.HandleAsync(new RefreshCommand(token)));

        // Assert: NOTHING was rotated — handler must abort before any write.
        _refreshTokenRepositoryMock.Verify(r => r.RevokeAsync(It.IsAny<RefreshToken>(), default), Times.Never);
        _refreshTokenRepositoryMock.Verify(r => r.AddAsync(It.IsAny<RefreshToken>(), default), Times.Never);
    }

    [Fact]
    public async Task HandleAsync_RevokedToken_ThrowsInvalidRefreshTokenException()
    {
        // Arrange: a token whose IsRevoked flag is set. ExpiresAt stays in the
        // future to prove that revocation alone is enough to fail validation —
        // attempting to reuse a revoked token is a strong theft signal.
        const string token = "revoked-token";
        var existing = new RefreshToken
        {
            Id = Guid.NewGuid(),
            UserId = Guid.NewGuid(),
            Token = token,
            ExpiresAt = DateTime.UtcNow.AddDays(7),
            IsRevoked = true,
            CreatedAt = DateTime.UtcNow.AddHours(-1)
        };
        _refreshTokenRepositoryMock
            .Setup(r => r.GetByTokenAsync(token, default))
            .ReturnsAsync(existing);

        // Act + Assert
        await Assert.ThrowsAsync<InvalidRefreshTokenException>(
            () => _handler.HandleAsync(new RefreshCommand(token)));

        _refreshTokenRepositoryMock.Verify(r => r.RevokeAsync(It.IsAny<RefreshToken>(), default), Times.Never);
        _refreshTokenRepositoryMock.Verify(r => r.AddAsync(It.IsAny<RefreshToken>(), default), Times.Never);
    }
}
