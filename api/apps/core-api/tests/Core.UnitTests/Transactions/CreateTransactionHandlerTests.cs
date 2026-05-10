using Core.Application.UseCases.Transactions.CreateTransaction;
using Core.Domain.Exceptions;
using Core.Domain.Interfaces;
using Core.Infrastructure;
using Moq;

namespace Core.UnitTests.Transactions;

// CreateTransactionHandler depends only on abstractions, so Moq covers
// every dependency without needing a database.
public class CreateTransactionHandlerTests
{
    private readonly Mock<ITransactionRepository> _txRepoMock = new();
    private readonly Mock<IMeiRepository> _meiRepoMock = new();
    private readonly CreateTransactionHandler _handler;

    public CreateTransactionHandlerTests()
    {
        _handler = new CreateTransactionHandler(_txRepoMock.Object, _meiRepoMock.Object);
    }

    [Fact]
    public async Task HandleAsync_ValidData_CallsAddAsyncOnce()
    {
        // Arrange: a MEI owned by the caller, valid transaction type.
        var userId = Guid.NewGuid();
        var meiId = Guid.NewGuid();
        var mei = new Mei { Id = meiId, UserId = userId, Name = "Caller's MEI" };
        _meiRepoMock
            .Setup(r => r.GetByIdAsync(meiId, default))
            .ReturnsAsync(mei);

        var command = new CreateTransactionCommand(
            meiId,
            userId,
            "income",
            "Sales",
            150.00m,
            new DateOnly(2026, 5, 10),
            "Customer payment");

        // Act
        var result = await _handler.HandleAsync(command);

        // Assert: persisted exactly once and the projection mirrors the input.
        _txRepoMock.Verify(r => r.AddAsync(It.IsAny<Transaction>(), default), Times.Once);
        Assert.NotEqual(Guid.Empty, result.Id);
        Assert.Equal(meiId, result.MeiId);
        Assert.Equal("income", result.Type);
        Assert.Equal(150.00m, result.Amount);
    }

    [Fact]
    public async Task HandleAsync_MeiOwnedByDifferentUser_ThrowsUnauthorizedAccessException()
    {
        // Arrange: the MEI exists, but it belongs to a DIFFERENT user.
        // This is the multi-tenant isolation test for the transactions
        // surface — without this branch any authenticated user could create
        // transactions inside any MEI by guessing its id.
        var callerId = Guid.NewGuid();
        var realOwnerId = Guid.NewGuid();
        var meiId = Guid.NewGuid();
        var foreignMei = new Mei { Id = meiId, UserId = realOwnerId, Name = "Someone else's MEI" };
        _meiRepoMock
            .Setup(r => r.GetByIdAsync(meiId, default))
            .ReturnsAsync(foreignMei);

        var command = new CreateTransactionCommand(
            meiId, callerId, "income", "Sales", 100m, new DateOnly(2026, 5, 10), null);

        // Act + Assert
        await Assert.ThrowsAsync<UnauthorizedAccessException>(() => _handler.HandleAsync(command));

        // Assert: nothing was persisted — the handler must abort before
        // touching the transactions table.
        _txRepoMock.Verify(r => r.AddAsync(It.IsAny<Transaction>(), default), Times.Never);
    }

    [Fact]
    public async Task HandleAsync_InvalidType_ThrowsInvalidTransactionTypeException()
    {
        // Arrange: ownership is fine, but Type is something other than
        // "income" / "expense". Ownership check passes first (per the
        // handler's order — see comment in CreateTransactionHandler about
        // why ownership is validated before type).
        var userId = Guid.NewGuid();
        var meiId = Guid.NewGuid();
        var mei = new Mei { Id = meiId, UserId = userId, Name = "Caller's MEI" };
        _meiRepoMock
            .Setup(r => r.GetByIdAsync(meiId, default))
            .ReturnsAsync(mei);

        var command = new CreateTransactionCommand(
            meiId, userId, "transfer", "Sales", 100m, new DateOnly(2026, 5, 10), null);

        // Act + Assert
        await Assert.ThrowsAsync<InvalidTransactionTypeException>(() => _handler.HandleAsync(command));

        _txRepoMock.Verify(r => r.AddAsync(It.IsAny<Transaction>(), default), Times.Never);
    }
}
