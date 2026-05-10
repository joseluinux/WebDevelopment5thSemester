namespace Core.Application.UseCases.Meis;

// Wire-safe projection of the Mei entity, shared by every MEI use case
// (GetMeis, GetMei, CreateMei, UpdateMei).
//
// Why a dedicated DTO rather than serializing the entity directly:
// Mei has a `User` navigation property — and `User` carries `PasswordHash`.
// If a controller ever returned the entity straight to the wire (or if EF
// lazy-loaded the navigation during JSON serialization), every MEI response
// would leak a BCrypt hash. A narrow DTO makes that whole class of bug
// impossible.
//
// Also note: there is no UserId on this DTO. The owning user id is implicit
// from the JWT — exposing it again would be redundant and would force every
// future schema change ("user X transferred MEI to user Y?") to ripple
// through the wire format.
public record MeiResult(
    Guid Id,
    string Name,
    string? Cnpj,
    string? Cnae,
    decimal? AnnualLimit,
    string? Plan,
    DateTime CreatedAt,
    DateTime? UpdatedAt);
