using Core.Application.UseCases.Users.UpdateProfile;
using Core.Domain.Exceptions;
using Core.Domain.Interfaces;
using Core.Infrastructure;
using Moq;

namespace Core.UnitTests.Users;

// UpdateProfileHandler depends only on IUserRepository, so Moq is enough —
// no DbContext or HTTP plumbing is exercised in these tests.
public class UpdateProfileHandlerTests
{
    private readonly Mock<IUserRepository> _repositoryMock = new();
    private readonly UpdateProfileHandler _handler;

    public UpdateProfileHandlerTests()
    {
        _handler = new UpdateProfileHandler(_repositoryMock.Object);
    }

    [Fact]
    public async Task HandleAsync_ValidData_CallsUpdateAsyncOnce()
    {
        // Arrange: an existing user, and a command that changes their name
        // and email to a brand-new (unused) address.
        var user = new User
        {
            Id = Guid.NewGuid(),
            Name = "Old Name",
            Email = "old@example.com",
            PasswordHash = "irrelevant-for-update",
            CreatedAt = DateTime.UtcNow.AddDays(-10)
        };

        _repositoryMock
            .Setup(r => r.GetByIdAsync(user.Id, default))
            .ReturnsAsync(user);
        // Email-uniqueness check returns null -> the new address is free.
        _repositoryMock
            .Setup(r => r.GetByEmailAsync("new@example.com", default))
            .ReturnsAsync((User?)null);

        var command = new UpdateProfileCommand(user.Id, "New Name", "new@example.com");

        // Act
        var result = await _handler.HandleAsync(command);

        // Assert: the update was persisted exactly once and the returned
        // DTO mirrors the new state.
        _repositoryMock.Verify(r => r.UpdateAsync(It.IsAny<User>(), default), Times.Once);
        Assert.Equal("New Name", result.Name);
        Assert.Equal("new@example.com", result.Email);
    }

    [Fact]
    public async Task HandleAsync_EmailTakenByAnotherUser_ThrowsEmailAlreadyTakenException()
    {
        // Arrange: caller wants to switch to "taken@example.com", but that
        // address already belongs to a DIFFERENT user (different Id).
        // This is the multi-tenant uniqueness invariant — without this check
        // a malicious user could squat on someone else's email.
        var caller = new User
        {
            Id = Guid.NewGuid(),
            Name = "Caller",
            Email = "caller@example.com",
            PasswordHash = "irrelevant"
        };
        var owner = new User
        {
            Id = Guid.NewGuid(), // different id -> conflict
            Name = "Existing Owner",
            Email = "taken@example.com",
            PasswordHash = "irrelevant"
        };

        _repositoryMock
            .Setup(r => r.GetByIdAsync(caller.Id, default))
            .ReturnsAsync(caller);
        _repositoryMock
            .Setup(r => r.GetByEmailAsync("taken@example.com", default))
            .ReturnsAsync(owner);

        var command = new UpdateProfileCommand(caller.Id, "Caller", "taken@example.com");

        // Act + Assert
        await Assert.ThrowsAsync<EmailAlreadyTakenException>(() => _handler.HandleAsync(command));

        // Assert: nothing was persisted — the handler must abort before
        // calling UpdateAsync when the conflict is detected.
        _repositoryMock.Verify(r => r.UpdateAsync(It.IsAny<User>(), default), Times.Never);
    }
}
