using Core.Application.Interfaces;
using Core.Domain.Exceptions;
using Core.Domain.Interfaces;

namespace Core.Application.UseCases.Imports.PreviewImport;

// Uploads the file to Supabase and calls FastAPI for classification
// WITHOUT persisting anything to the database. The result is returned
// to the frontend for user review before confirmation.
public class PreviewImportHandler
{
    private readonly IMeiRepository _meiRepository;
    private readonly IStorageService _storageService;
    private readonly IFastApiService _fastApiService;

    private const string ImportsBucket = "imports";

    public PreviewImportHandler(
        IMeiRepository meiRepository,
        IStorageService storageService,
        IFastApiService fastApiService)
    {
        _meiRepository = meiRepository;
        _storageService = storageService;
        _fastApiService = fastApiService;
    }

    public async Task<PreviewImportResult> HandleAsync(
        PreviewImportCommand command,
        CancellationToken cancellationToken = default)
    {
        // Validate MEI ownership
        var mei = await _meiRepository.GetByIdAsync(command.MeiId, cancellationToken);
        if (mei is null)
            throw new MeiNotFoundException(command.MeiId);
        if (mei.UserId != command.UserId)
            throw new UnauthorizedAccessException("You do not have access to this MEI.");

        // Upload the file to Supabase Storage
        var storageKey = $"{command.MeiId}/{Guid.NewGuid()}-{command.FileName}";
        var fileUrl = await _storageService.UploadFileAsync(
            ImportsBucket,
            storageKey,
            command.FileStream,
            command.ContentType,
            cancellationToken);

        // Call FastAPI — use a temporary correlation ID (no DB record yet)
        var correlationId = Guid.NewGuid().ToString();
        var response = await _fastApiService.ProcessImportAsync(
            correlationId,
            command.MeiId.ToString(),
            fileUrl,
            cancellationToken);

        return new PreviewImportResult(
            FileUri: fileUrl,
            FileName: command.FileName,
            Transactions: response.Transactions,
            Products: response.Products,
            Employees: response.Employees,
            TotalRows: response.TotalRows,
            ProcessedRows: response.ProcessedRows,
            Errors: response.Errors ?? Array.Empty<string>(),
            Status: response.Status);
    }
}
