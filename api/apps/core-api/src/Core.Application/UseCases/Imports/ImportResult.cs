namespace Core.Application.UseCases.Imports;

// Wire-safe projection of one Import row.
//
// Why a dedicated DTO rather than serializing the entity directly:
// Import has a `Mei` navigation, and Mei -> User -> PasswordHash. If we
// ever returned the entity straight to the wire, every imports response
// would risk leaking credentials. A narrow DTO makes that impossible.
//
// The Errors column is jsonb on the database (a JSON-encoded array of
// strings); the read repositories store it as the raw JSON string and
// callers parse it into IReadOnlyList<string>? for the wire. Null on the
// DTO means "no errors recorded" — the same way the column is null on a
// fresh insert.
public record ImportResult(
    Guid Id,
    Guid MeiId,
    string FileUri,
    string Status,
    int? TotalRows,
    int? ProcessedRows,
    IReadOnlyList<string>? Errors,
    DateTime CreatedAt,
    DateTime? UpdatedAt);
