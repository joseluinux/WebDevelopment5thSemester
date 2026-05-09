using Core.Application.UseCases.Auth.Register;
using Core.Domain.Exceptions;
using Core.Domain.Interfaces;
using Core.Infrastructure;
using Moq;

namespace Core.UnitTests.Auth;

// Because RegisterHandler depends on IUserRepository (an interface), Moq can replace the
// real database with a controlled fake — no database connection needed in these tests.
public class RegisterHandlerTests
{
    private readonly Mock<IUserRepository> _repositoryMock = new();
    private readonly RegisterHandler _handler;

    public RegisterHandlerTests()
    {
        _handler = new RegisterHandler(_repositoryMock.Object);
    }

    [Fact]
    public async Task HandleAsync_ValidData_CallsAddAsyncOnce()
    {
        // Arrange: simulate no existing user for this email (happy path).
        _repositoryMock
            .Setup(r => r.GetByEmailAsync("new@example.com", default))
            .ReturnsAsync((User?)null);

        var command = new RegisterCommand("Test User", "new@example.com", "Password123!");
        await _handler.HandleAsync(command);

        // Assert: the handler must have persisted exactly one new user.
        _repositoryMock.Verify(r => r.AddAsync(It.IsAny<User>(), default), Times.Once);
    }

    [Fact]
    public async Task HandleAsync_DuplicateEmail_ThrowsEmailAlreadyTakenException()
    {
        // Arrange: simulate an existing user already registered with this email.
        var existing = new User { Id = Guid.NewGuid(), Email = "taken@example.com", PasswordHash = "hash" };
        _repositoryMock
            .Setup(r => r.GetByEmailAsync("taken@example.com", default))
            .ReturnsAsync(existing);

        var command = new RegisterCommand("Test User", "taken@example.com", "Password123!");

        // Assert: the handler must abort with a domain exception before attempting any write.
        await Assert.ThrowsAsync<EmailAlreadyTakenException>(() => _handler.HandleAsync(command));
    }
}
