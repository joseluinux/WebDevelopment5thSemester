namespace Core.Application.UseCases.Meis.UpdateMei;

// Input for editing an existing MEI.
//
// CNPJ is intentionally not part of the update surface — once a MEI is
// created with a given CNPJ it should not be silently changed (it identifies
// a real company in the Receita Federal). If renaming a CNPJ ever becomes
// a real product requirement, add it then with its own validation rules.
public record UpdateMeiCommand(
    Guid UserId,
    Guid MeiId,
    string Name,
    string? Cnae,
    decimal? AnnualLimit,
    string? Plan);
