using System.Text.Json;
using Core.Application.UseCases.Imports.PreviewImport;
using Core.Domain.Exceptions;
using Core.Domain.Interfaces;
using Core.Infrastructure;

namespace Core.Application.UseCases.Imports.ConfirmImport;

// Persists the data the user confirmed from the preview step.
// No file upload or FastAPI call — the preview already did that.
public class ConfirmImportHandler
{
    private readonly IMeiRepository _meiRepository;
    private readonly IImportRepository _importRepository;
    private readonly ITransactionRepository _transactionRepository;
    private readonly IProductRepository _productRepository;
    private readonly IEmployeeRepository _employeeRepository;

    public ConfirmImportHandler(
        IMeiRepository meiRepository,
        IImportRepository importRepository,
        ITransactionRepository transactionRepository,
        IProductRepository productRepository,
        IEmployeeRepository employeeRepository)
    {
        _meiRepository = meiRepository;
        _importRepository = importRepository;
        _transactionRepository = transactionRepository;
        _productRepository = productRepository;
        _employeeRepository = employeeRepository;
    }

    public async Task<ImportResult> HandleAsync(
        ConfirmImportCommand command,
        CancellationToken cancellationToken = default)
    {
        var preview = command.Preview;

        // Validate MEI ownership
        var mei = await _meiRepository.GetByIdAsync(command.MeiId, cancellationToken);
        if (mei is null)
            throw new MeiNotFoundException(command.MeiId);
        if (mei.UserId != command.UserId)
            throw new UnauthorizedAccessException("You do not have access to this MEI.");

        // Map FastAPI status to DB status
        var dbStatus = preview.Status switch
        {
            "success" => "completed",
            "partial" => "partial",
            "error" => "error",
            _ => "completed"
        };

        // Create the Import record
        var import = new Import
        {
            Id = Guid.NewGuid(),
            MeiId = command.MeiId,
            FileUri = preview.FileUri,
            Status = dbStatus,
            TotalRows = preview.TotalRows,
            ProcessedRows = preview.ProcessedRows,
            Errors = (preview.Errors is { Count: > 0 })
                ? JsonSerializer.Serialize(preview.Errors)
                : null,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        };
        await _importRepository.AddAsync(import, cancellationToken);

        // Persist transactions
        foreach (var tx in preview.Transactions)
        {
            await _transactionRepository.AddAsync(new Transaction
            {
                Id = Guid.NewGuid(),
                MeiId = command.MeiId,
                ImportId = import.Id,
                Type = tx.Type,
                Category = tx.Category,
                Amount = tx.Amount,
                Description = tx.Description,
                Date = DateOnly.Parse(tx.Date),
                CreatedAt = DateTime.UtcNow
            }, cancellationToken);
        }

        // Persist products
        foreach (var product in preview.Products)
        {
            await _productRepository.AddAsync(new Product
            {
                Id = Guid.NewGuid(),
                MeiId = command.MeiId,
                Name = product.Name,
                Cost = product.Cost,
                Price = product.Price,
                DesiredMargin = product.DesiredMargin,
                CreatedAt = DateTime.UtcNow
            }, cancellationToken);
        }

        // Persist employees
        foreach (var employee in preview.Employees)
        {
            await _employeeRepository.AddAsync(new Employee
            {
                Id = Guid.NewGuid(),
                MeiId = command.MeiId,
                Name = employee.Name,
                ContractType = employee.ContractType,
                Salary = employee.Salary,
                Charges = employee.Charges,
                CreatedAt = DateTime.UtcNow
            }, cancellationToken);
        }

        return ImportResultMapper.ToResult(import);
    }
}
