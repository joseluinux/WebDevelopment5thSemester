namespace Core.Domain.Exceptions;

// Thrown when a Create employee request carries a ContractType outside the
// allowed set. Same shape as InvalidProductStatusException — the canonical
// valid set lives on the exception so handlers can't drift.
//
// "clt"     -> Brazilian formal employment contract (Consolidação das Leis
//              do Trabalho).
// "pj"      -> Pessoa Jurídica — service contractor.
// "intern"  -> Estagiário, governed by Lei do Estágio.
// Any future contract type must be added here AND in the Postgres CHECK
// constraint (if/when one exists) so app and DB stay in agreement.
public class InvalidContractTypeException : Exception
{
    public static readonly IReadOnlyList<string> ValidContractTypes = new[] { "clt", "pj", "intern" };

    public InvalidContractTypeException(string? contractType)
        : base($"Invalid contract type '{contractType}'. Allowed: {string.Join(", ", ValidContractTypes)}.") { }
}
