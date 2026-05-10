namespace Core.Application.UseCases.Transactions;

// Wire-safe projection of the Transaction entity, shared by every
// transaction use case.
//
// Why a dedicated DTO rather than serializing the entity directly:
// Transaction has a `Mei` navigation, and Mei has a `User` navigation, and
// User has `PasswordHash`. If a controller ever returned the entity
// straight to the wire (or if EF lazy-loaded the chain during JSON
// serialization), every transaction response would leak credentials. A
// narrow DTO makes that whole class of bug impossible.
//
// MeiId is included on the wire so clients building a per-MEI dashboard
// can attribute a row to its parent without an extra round-trip.
public record TransactionResult(
    Guid Id,
    Guid MeiId,
    string Type,
    string? Category,
    decimal Amount,
    DateOnly Date,
    string? Description,
    DateTime CreatedAt,
    DateTime? UpdatedAt);
