using Core.Application.UseCases.Products.CreateProduct;
using Core.Domain.Exceptions;
using Core.Domain.Interfaces;
using Core.Infrastructure;
using Moq;

namespace Core.UnitTests.Products;

// CreateProductHandler depends only on abstractions, so Moq covers every
// dependency without needing a database.
public class CreateProductHandlerTests
{
    private readonly Mock<IProductRepository> _productRepoMock = new();
    private readonly Mock<IMeiRepository> _meiRepoMock = new();
    private readonly CreateProductHandler _handler;

    public CreateProductHandlerTests()
    {
        _handler = new CreateProductHandler(_productRepoMock.Object, _meiRepoMock.Object);
    }

    [Fact]
    public async Task HandleAsync_ValidData_CallsAddAsyncOnce()
    {
        // Arrange: a MEI owned by the caller, valid status, positive price.
        var userId = Guid.NewGuid();
        var meiId = Guid.NewGuid();
        var mei = new Mei { Id = meiId, UserId = userId, Name = "Caller's MEI" };
        _meiRepoMock
            .Setup(r => r.GetByIdAsync(meiId, default))
            .ReturnsAsync(mei);

        var command = new CreateProductCommand(
            meiId, userId, "Coffee", 5.00m, 12.00m, 30m, "active");

        // Act
        var result = await _handler.HandleAsync(command);

        // Assert: persisted exactly once and the projection carries the
        // calculated margin (here (12 - 5) / 12 * 100 ≈ 58.3%, well above
        // the 30% target).
        _productRepoMock.Verify(r => r.AddAsync(It.IsAny<Product>(), default), Times.Once);
        Assert.NotEqual(Guid.Empty, result.Id);
        Assert.Equal(meiId, result.MeiId);
        Assert.Equal("Coffee", result.Name);
        Assert.True(result.Margin > 30m, "Expected calculated margin to exceed desired margin.");
        Assert.False(result.IsMarginBelowDesired);
    }

    [Fact]
    public async Task HandleAsync_InvalidStatus_ThrowsInvalidProductStatusException()
    {
        // Arrange: ownership is fine; status is not in the allowed set.
        // Ownership check passes first (per the handler's order — see
        // CreateProductHandler comments about why ownership is validated
        // before input validation).
        var userId = Guid.NewGuid();
        var meiId = Guid.NewGuid();
        var mei = new Mei { Id = meiId, UserId = userId, Name = "Caller's MEI" };
        _meiRepoMock
            .Setup(r => r.GetByIdAsync(meiId, default))
            .ReturnsAsync(mei);

        var command = new CreateProductCommand(
            meiId, userId, "Coffee", 5.00m, 12.00m, 30m, "draft");

        // Act + Assert
        await Assert.ThrowsAsync<InvalidProductStatusException>(() => _handler.HandleAsync(command));

        // Nothing was persisted — the handler must abort before any write.
        _productRepoMock.Verify(r => r.AddAsync(It.IsAny<Product>(), default), Times.Never);
    }

    [Fact]
    public async Task HandleAsync_PriceEqualToZero_ThrowsInvalidProductPriceException()
    {
        // Arrange: ownership is fine, status is valid, but Price is 0.
        // Zero is rejected — strict positivity is required because the
        // margin formula ((Price - Cost) / Price * 100) would otherwise
        // divide by zero.
        var userId = Guid.NewGuid();
        var meiId = Guid.NewGuid();
        var mei = new Mei { Id = meiId, UserId = userId, Name = "Caller's MEI" };
        _meiRepoMock
            .Setup(r => r.GetByIdAsync(meiId, default))
            .ReturnsAsync(mei);

        var command = new CreateProductCommand(
            meiId, userId, "Coffee", 5.00m, 0m, 30m, "active");

        // Act + Assert
        await Assert.ThrowsAsync<InvalidProductPriceException>(() => _handler.HandleAsync(command));

        _productRepoMock.Verify(r => r.AddAsync(It.IsAny<Product>(), default), Times.Never);
    }
}
