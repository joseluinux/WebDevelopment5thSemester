using Core.Application.DTOs;

namespace Core.Application.UseCases.Imports.PreviewImport;

// Returned by the preview endpoint. The frontend shows this data to the
// user before confirming the import. The same record is sent back as the
// request body to the confirm endpoint — no server-side state needed.
public record PreviewImportResult(
    string FileUri,
    string FileName,
    IReadOnlyList<ImportTransactionDto> Transactions,
    IReadOnlyList<ImportProductDto> Products,
    IReadOnlyList<ImportEmployeeDto> Employees,
    int TotalRows,
    int ProcessedRows,
    IReadOnlyList<string> Errors,
    string Status);
