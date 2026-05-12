using System.Text.Json;
using Core.Application.DTOs;
using Core.Application.Interfaces;
using Core.Domain.Exceptions;
using Core.Domain.Interfaces;
using Core.Infrastructure;

namespace Core.Application.UseCases.Imports.CreateImport;

// Orchestrates the full upload-and-process flow described in the slice
// spec. Synchronous: the controller awaits this end-to-end and returns
// the final Import row to the client.
//
// The Import record is the single source of truth for what happened:
//   - It is created BEFORE the FastAPI call so even a transport failure
//     leaves a row behind (status "error", errors populated). The spec
//     is explicit: "never leave an import stuck in 'processing'".
//   - Status transitions: "processing" -> "completed" | "partial" | "error".
//   - Counters / errors are mirrored from the FastAPI response.
public class CreateImportHandler
{
    private readonly IMeiRepository _meiRepository;
    private readonly IImportRepository _importRepository;
    private readonly IStorageService _storageService;
    private readonly IFastApiService _fastApiService;
    private readonly ITransactionRepository _transactionRepository;
    private readonly IProductRepository _productRepository;
    private readonly IEmployeeRepository _employeeRepository;

    // The bucket name is hardcoded by design: every import in this
    // application goes to the same bucket. Promoting it to a constructor
    // parameter or appsettings entry would invite drift between
    // environments without a real use case.
    private const string ImportsBucket = "imports";

    public CreateImportHandler(
        IMeiRepository meiRepository,
        IImportRepository importRepository,
        IStorageService storageService,
        IFastApiService fastApiService,
        ITransactionRepository transactionRepository,
        IProductRepository productRepository,
        IEmployeeRepository employeeRepository)
    {
        _meiRepository = meiRepository;
        _importRepository = importRepository;
        _storageService = storageService;
        _fastApiService = fastApiService;
        _transactionRepository = transactionRepository;
        _productRepository = productRepository;
        _employeeRepository = employeeRepository;
    }

    public async Task<ImportResult> HandleAsync(
        CreateImportCommand command,
        CancellationToken cancellationToken = default)
    {
        // Step 1 — Validate MEI ownership BEFORE doing any I/O.
        // Performed first so a probe against someone else's MEI returns
        // 403 immediately without uploading bytes to Supabase or burning
        // an LLM call.
        var mei = await _meiRepository.GetByIdAsync(command.MeiId, cancellationToken);
        if (mei is null)
            throw new MeiNotFoundException(command.MeiId);
        if (mei.UserId != command.UserId)
            throw new UnauthorizedAccessException("You do not have access to this MEI.");

        // Step 2 — Upload the file to Supabase Storage.
        // The key is prefixed with the MEI id and a fresh GUID so two
        // imports for the same file name never collide and a malicious
        // client cannot guess another tenant's URLs.
        var storageKey = $"{command.MeiId}/{Guid.NewGuid()}-{command.FileName}";
        var fileUrl = await _storageService.UploadFileAsync(
            ImportsBucket,
            storageKey,
            command.FileStream,
            command.ContentType,
            cancellationToken);

        // Step 3 — Create the Import record with status "processing".
        // We persist BEFORE the FastAPI call so the row exists no matter
        // what happens next: a hard crash, a network failure, or a slow
        // LLM all leave a recoverable state behind.
        var import = new Import
        {
            Id = Guid.NewGuid(),
            MeiId = command.MeiId,
            FileUri = fileUrl,
            Status = "processing",
            ProcessedRows = 0,
            CreatedAt = DateTime.UtcNow
        };
        await _importRepository.AddAsync(import, cancellationToken);

        // Step 4 — Call FastAPI. Any transport failure is caught here so
        // we can transition the row to "error" and return a meaningful
        // status to the client instead of letting the exception escape
        // and leaving the row stuck in "processing".
        ImportResponse? response = null;
        string? transportError = null;
        try
        {
            response = await _fastApiService.ProcessImportAsync(
                import.Id.ToString(),
                command.MeiId.ToString(),
                fileUrl,
                cancellationToken);
        }
        catch (Exception ex)
        {
            // Surface the exception type AND message — the type matters
            // for triage (HttpRequestException vs JsonException tell
            // very different stories), and the message often carries
            // the actual reason (DNS failure, 500 from FastAPI, etc.).
            transportError = $"{ex.GetType().Name}: {ex.Message}";
        }

        if (response is null)
        {
            // Step 4a — FastAPI unreachable / threw. Mark the row as
            // errored, store the transport error, and return early.
            // No transactions / products / employees are persisted in
            // this branch because we have nothing trustworthy to write.
            import.Status = "error";
            import.Errors = JsonSerializer.Serialize(new[]
            {
                transportError ?? "Unknown failure calling FastAPI."
            });
            import.UpdatedAt = DateTime.UtcNow;
            await _importRepository.UpdateAsync(import, cancellationToken);
            return ImportResultMapper.ToResult(import);
        }

        // Step 5 — Persist transactions, products and employees from
        // the FastAPI response using their existing repositories.
        // Each row gets the new Import.Id stamped on it (Transaction
        // has an FK; Product / Employee don't, but the audit trail
        // lives on the Import itself via FileUri + counters).
        foreach (var tx in response.Transactions)
        {
            var entity = new Transaction
            {
                Id = Guid.NewGuid(),
                MeiId = command.MeiId,
                ImportId = import.Id,
                Type = tx.Type,
                Category = tx.Category,
                Amount = tx.Amount,
                Description = tx.Description,
                // FastAPI sends "YYYY-MM-DD" — DateOnly.Parse uses
                // InvariantCulture by default, so locale drift on the
                // host machine cannot affect the result.
                Date = DateOnly.Parse(tx.Date),
                CreatedAt = DateTime.UtcNow
            };
            await _transactionRepository.AddAsync(entity, cancellationToken);
        }

        foreach (var product in response.Products)
        {
            var entity = new Product
            {
                Id = Guid.NewGuid(),
                MeiId = command.MeiId,
                Name = product.Name,
                Cost = product.Cost,
                Price = product.Price,
                DesiredMargin = product.DesiredMargin,
                // No Status from FastAPI: rely on the column default
                // ("active") configured in AppDbContext.
                CreatedAt = DateTime.UtcNow
            };
            await _productRepository.AddAsync(entity, cancellationToken);
        }

        foreach (var employee in response.Employees)
        {
            var entity = new Employee
            {
                Id = Guid.NewGuid(),
                MeiId = command.MeiId,
                Name = employee.Name,
                ContractType = employee.ContractType,
                Salary = employee.Salary,
                Charges = employee.Charges,
                CreatedAt = DateTime.UtcNow
            };
            await _employeeRepository.AddAsync(entity, cancellationToken);
        }

        // Step 6 — Update the Import row with the final status,
        // counters, and any row-level errors reported by FastAPI.
        // Status mapping:
        //   FastAPI "success" -> "completed"
        //   FastAPI "partial" -> "partial"
        //   FastAPI "error"   -> "error"
        // Anything else falls through to "error" so we never store an
        // unknown status that downstream UIs might not handle.
        import.Status = response.Status switch
        {
            "success" => "completed",
            "partial" => "partial",
            "error" => "error",
            _ => "error"
        };
        import.TotalRows = response.TotalRows;
        import.ProcessedRows = response.ProcessedRows;
        import.Errors = (response.Errors is { Count: > 0 })
            ? JsonSerializer.Serialize(response.Errors)
            : null;
        import.UpdatedAt = DateTime.UtcNow;
        await _importRepository.UpdateAsync(import, cancellationToken);

        // Step 7 — Return the final Import as a wire-safe DTO.
        return ImportResultMapper.ToResult(import);
    }
}
