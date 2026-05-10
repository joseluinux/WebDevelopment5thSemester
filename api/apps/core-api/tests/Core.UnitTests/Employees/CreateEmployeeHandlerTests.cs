using Core.Application.UseCases.Employees.CreateEmployee;
using Core.Domain.Exceptions;
using Core.Domain.Interfaces;
using Core.Infrastructure;
using Moq;

namespace Core.UnitTests.Employees;

public class CreateEmployeeHandlerTests
{
    private readonly Mock<IEmployeeRepository> _employeeRepoMock = new();
    private readonly Mock<IMeiRepository> _meiRepoMock = new();
    private readonly CreateEmployeeHandler _handler;

    public CreateEmployeeHandlerTests()
    {
        _handler = new CreateEmployeeHandler(_employeeRepoMock.Object, _meiRepoMock.Object);
    }

    [Fact]
    public async Task HandleAsync_ValidData_CallsAddAsyncOnce()
    {
        // Arrange: a MEI owned by the caller, valid contract type,
        // strictly positive salary.
        var userId = Guid.NewGuid();
        var meiId = Guid.NewGuid();
        var mei = new Mei { Id = meiId, UserId = userId, Name = "Caller's MEI" };
        _meiRepoMock
            .Setup(r => r.GetByIdAsync(meiId, default))
            .ReturnsAsync(mei);

        var command = new CreateEmployeeCommand(
            meiId, userId, "Maria Silva", "clt", 1500m, 450m);

        // Act
        await _handler.HandleAsync(command);

        // Assert: persisted exactly once.
        _employeeRepoMock.Verify(r => r.AddAsync(It.IsAny<Employee>(), default), Times.Once);
    }

    [Fact]
    public async Task HandleAsync_InvalidContractType_ThrowsInvalidContractTypeException()
    {
        // Arrange: ownership is fine; ContractType is not in the allowed
        // set. Ownership check passes first (per the handler's order — see
        // CreateEmployeeHandler comments about why ownership is validated
        // before input validation).
        var userId = Guid.NewGuid();
        var meiId = Guid.NewGuid();
        var mei = new Mei { Id = meiId, UserId = userId, Name = "Caller's MEI" };
        _meiRepoMock
            .Setup(r => r.GetByIdAsync(meiId, default))
            .ReturnsAsync(mei);

        var command = new CreateEmployeeCommand(
            meiId, userId, "Maria Silva", "freelancer", 1500m, 450m);

        // Act + Assert
        await Assert.ThrowsAsync<InvalidContractTypeException>(() => _handler.HandleAsync(command));

        // Nothing was persisted — the handler must abort before any write.
        _employeeRepoMock.Verify(r => r.AddAsync(It.IsAny<Employee>(), default), Times.Never);
    }

    [Fact]
    public async Task HandleAsync_SalaryEqualToZero_ThrowsInvalidSalaryException()
    {
        // Arrange: ownership is fine, contract type is valid, but Salary
        // is 0. Strictly positive — see CreateEmployeeHandler comments.
        var userId = Guid.NewGuid();
        var meiId = Guid.NewGuid();
        var mei = new Mei { Id = meiId, UserId = userId, Name = "Caller's MEI" };
        _meiRepoMock
            .Setup(r => r.GetByIdAsync(meiId, default))
            .ReturnsAsync(mei);

        var command = new CreateEmployeeCommand(
            meiId, userId, "Maria Silva", "clt", 0m, 450m);

        // Act + Assert
        await Assert.ThrowsAsync<InvalidSalaryException>(() => _handler.HandleAsync(command));

        _employeeRepoMock.Verify(r => r.AddAsync(It.IsAny<Employee>(), default), Times.Never);
    }
}
