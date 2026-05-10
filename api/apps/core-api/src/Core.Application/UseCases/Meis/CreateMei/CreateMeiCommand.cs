namespace Core.Application.UseCases.Meis.CreateMei;

// Input for creating a new MEI.
//
// UserId is supplied by the controller from the JWT — the request body has
// no say in who owns the new row. Cnpj/Cnae/AnnualLimit/Plan are nullable to
// match the entity's nullable columns; they may be filled in later by an
// "edit MEI" flow.
public record CreateMeiCommand(
    Guid UserId,
    string Name,
    string? Cnpj,
    string? Cnae,
    decimal? AnnualLimit,
    string? Plan);
