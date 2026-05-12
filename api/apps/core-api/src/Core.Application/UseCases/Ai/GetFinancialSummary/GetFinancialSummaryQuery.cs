namespace Core.Application.UseCases.Ai.GetFinancialSummary;

// Input for the period-aware financial summary endpoint.
//
// MeiId comes from the URL, UserId from the JWT. From / To are
// optional query-string parameters and are inclusive on both ends —
// matching the convention already established by
// GetTransactionsQuery. Either one may be null to mean "no lower /
// upper bound". Both null = "all time".
public record GetFinancialSummaryQuery(
    Guid MeiId,
    Guid UserId,
    DateOnly? From,
    DateOnly? To);
