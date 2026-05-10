using Core.Application.UseCases.Auth.GetMe;
using Core.Domain.Exceptions;
using Core.Domain.Interfaces;
using Core.Infrastructure;
using Moq;

namespace Core.UnitTests.Auth;

// GetMeHandler depends only on IUserRepository, so Moq is enough — no DbContext
// or HTTP plumbing is exercised in these tests.
public class GetMeHandlerTests
{
    private readonly Mock<IUserRepository> _repositoryMock = new();
    private readonly GetMeHandler _handler;

    public GetMeHandlerTests()
    {
        _handler = new GetMeHandler(_repositoryMock.Object);
    }

    [Fact]
    public async Task HandleAsync_UserExists_ReturnsGetMeResultWithEntityFields()
    {
        // Arrange: a known user the repository will return for the queried id.
        var user = new User
        {
            Id = Guid.NewGuid(),
            Name = "Joana Silva",
            Email = "joana@example.com",
            // PasswordHash is set to confirm it is NOT propagated to the result —
            // GetMeResult should expose only the safe public fields.
            PasswordHash = "should-not-leak",
            CreatedAt = new DateTime(2026, 5, 9, 12, 0, 0, DateTimeKind.Utc)
        };

        _repositoryMock
            .Setup(r => r.GetByIdAsync(user.Id, default))
            .ReturnsAsync(user);

        // Act
        var result = await _handler.HandleAsync(new GetMeQuery(user.Id));

        // Assert: every field is mapped 1:1 from the entity to the safe DTO.
        Assert.Equal(user.Id, result.Id);
        Assert.Equal(user.Name, result.Name);
        Assert.Equal(user.Email, result.Email);
        Assert.Equal(user.CreatedAt, result.CreatedAt);
    }

    [Fact]
    public async Task HandleAsync_UserNotFound_ThrowsUserNotFoundException()
    {
        // Arrange: a valid-looking id whose row no longer exists (e.g. the user
        // was deleted after their JWT was issued).
        var missingId = Guid.NewGuid();
        _repositoryMock
            .Setup(r => r.GetByIdAsync(missingId, default))
            .ReturnsAsync((User?)null);

        // Act + Assert: the handler must surface the missing-user case as a
        // domain exception so the controller can map it to 404.
        await Assert.ThrowsAsync<UserNotFoundException>(
            () => _handler.HandleAsync(new GetMeQuery(missingId)));
    }
}
