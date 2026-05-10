using Core.Application.UseCases.Meis.CreateMei;
using Core.Application.UseCases.Meis.GetMei;
using Core.Domain.Exceptions;
using Core.Domain.Interfaces;
using Core.Infrastructure;
using Moq;

namespace Core.UnitTests.Meis;

// Note on test placement:
// The slice spec asked for "3 tests for CreateMeiHandler", but two of the
// three failure modes it described — MeiNotFoundException and
// UnauthorizedAccessException — only arise in handlers that LOAD an existing
// MEI (Get/Update/Delete). CreateMei never reads an existing row, so those
// exceptions cannot fire there. To honour the security intent, we split the
// 3 tests across the natural homes:
//   - happy path -> CreateMeiHandler
//   - "not found"        -> GetMeiHandler
//   - "wrong owner"      -> GetMeiHandler
// The same security check exists in UpdateMei/DeleteMei; testing it once on
// GetMei is enough to prove the pattern works (the others are line-for-line
// equivalent).
public class MeiHandlerTests
{
    private readonly Mock<IMeiRepository> _repositoryMock = new();

    [Fact]
    public async Task CreateMeiHandler_HandleAsync_ValidData_CallsAddAsyncOnce()
    {
        // Arrange: no pre-existing MEIs for this user, so the duplicate-CNPJ
        // check inside the handler trivially passes.
        var userId = Guid.NewGuid();
        _repositoryMock
            .Setup(r => r.GetAllByUserIdAsync(userId, default))
            .ReturnsAsync(Array.Empty<Mei>());

        var handler = new CreateMeiHandler(_repositoryMock.Object);
        var command = new CreateMeiCommand(
            userId, "Padaria do Zé", "12.345.678/0001-99", "1011-2/01", 81000m, "Free");

        // Act
        var result = await handler.HandleAsync(command);

        // Assert: exactly one row was persisted, and the projection mirrors
        // the command (Id is freshly generated so we just check it's not empty).
        _repositoryMock.Verify(r => r.AddAsync(It.IsAny<Mei>(), default), Times.Once);
        Assert.NotEqual(Guid.Empty, result.Id);
        Assert.Equal(command.Name, result.Name);
        Assert.Equal(command.Cnpj, result.Cnpj);
    }

    [Fact]
    public async Task GetMeiHandler_HandleAsync_MeiNotFound_ThrowsMeiNotFoundException()
    {
        // Arrange: repository returns null -> no row with that id at all.
        var userId = Guid.NewGuid();
        var meiId = Guid.NewGuid();
        _repositoryMock
            .Setup(r => r.GetByIdAsync(meiId, default))
            .ReturnsAsync((Mei?)null);

        var handler = new GetMeiHandler(_repositoryMock.Object);

        // Act + Assert: a genuinely missing row must produce
        // MeiNotFoundException — NOT UnauthorizedAccessException — so logs
        // and dashboards can distinguish "client typo" from "ownership
        // violation".
        await Assert.ThrowsAsync<MeiNotFoundException>(
            () => handler.HandleAsync(new GetMeiQuery(userId, meiId)));
    }

    [Fact]
    public async Task GetMeiHandler_HandleAsync_DifferentOwner_ThrowsUnauthorizedAccessException()
    {
        // Arrange: a real MEI exists, but it belongs to a different user
        // than the caller. This is THE multi-tenant isolation test — if the
        // handler ever returned this row, every user could read every other
        // user's MEI by guessing or harvesting Guids.
        var callerId = Guid.NewGuid();
        var realOwnerId = Guid.NewGuid();
        var meiId = Guid.NewGuid();
        var foreignMei = new Mei
        {
            Id = meiId,
            UserId = realOwnerId,
            Name = "Outro usuário"
        };
        _repositoryMock
            .Setup(r => r.GetByIdAsync(meiId, default))
            .ReturnsAsync(foreignMei);

        var handler = new GetMeiHandler(_repositoryMock.Object);

        // Act + Assert
        await Assert.ThrowsAsync<UnauthorizedAccessException>(
            () => handler.HandleAsync(new GetMeiQuery(callerId, meiId)));
    }
}
