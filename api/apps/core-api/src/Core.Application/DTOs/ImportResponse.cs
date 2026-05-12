using System.Text.Json.Serialization;

namespace Core.Application.DTOs;

// Strongly-typed mirror of the JSON payload returned by the FastAPI
// /api/import/process endpoint.
//
// Why a dedicated DTO rather than reusing domain entities:
//   - The shapes are deliberately decoupled. FastAPI may classify rows it
//     cannot map cleanly to our schema (nullable cost/price, missing
//     contract type, etc.); this DTO honestly reflects that nullability
//     so the handler can decide what to do per row instead of EF Core
//     blowing up on a NOT NULL column.
//   - JSON property names follow the FastAPI convention (snake_case), so
//     every field carries an explicit [JsonPropertyName] attribute. This
//     lets the rest of the C# codebase stay in PascalCase regardless of
//     how the Python service names things now or later.
public record ImportResponse(
    [property: JsonPropertyName("import_id")] string ImportId,
    [property: JsonPropertyName("mei_id")] string MeiId,
    [property: JsonPropertyName("transactions")] IReadOnlyList<ImportTransactionDto> Transactions,
    [property: JsonPropertyName("products")] IReadOnlyList<ImportProductDto> Products,
    [property: JsonPropertyName("employees")] IReadOnlyList<ImportEmployeeDto> Employees,
    [property: JsonPropertyName("total_rows")] int TotalRows,
    [property: JsonPropertyName("processed_rows")] int ProcessedRows,
    // Errors is always an array on the wire (possibly empty), but we
    // accept null defensively so a malformed payload doesn't crash
    // deserialization — the handler treats null and empty the same way.
    [property: JsonPropertyName("errors")] IReadOnlyList<string>? Errors,
    // Status values: "success" | "partial" | "error". Translated into the
    // Import.Status DB column ("completed" | "partial" | "error") by
    // CreateImportHandler.
    [property: JsonPropertyName("status")] string Status);

// One transaction row classified by the LLM.
//
// Date is kept as a raw ISO-8601 string ("YYYY-MM-DD") and parsed into
// DateOnly inside the handler — System.Text.Json doesn't read DateOnly
// from a plain string by default, so accepting string keeps the payload
// tolerant and the conversion explicit.
public record ImportTransactionDto(
    [property: JsonPropertyName("type")] string Type,
    [property: JsonPropertyName("category")] string? Category,
    [property: JsonPropertyName("amount")] decimal Amount,
    [property: JsonPropertyName("description")] string? Description,
    [property: JsonPropertyName("date")] string Date);

// One product row classified by the LLM. Cost / price / desired_margin
// are all nullable because the LLM may detect a product name in a row
// without seeing any of its financial attributes.
public record ImportProductDto(
    [property: JsonPropertyName("name")] string Name,
    [property: JsonPropertyName("cost")] decimal? Cost,
    [property: JsonPropertyName("price")] decimal? Price,
    [property: JsonPropertyName("desired_margin")] decimal? DesiredMargin);

// One employee row classified by the LLM.
public record ImportEmployeeDto(
    [property: JsonPropertyName("name")] string Name,
    [property: JsonPropertyName("contract_type")] string? ContractType,
    [property: JsonPropertyName("salary")] decimal? Salary,
    [property: JsonPropertyName("charges")] decimal? Charges);
