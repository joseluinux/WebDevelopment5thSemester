namespace Core.Application.UseCases.Ai.GetFinancialSummary;

// Period-aware financial breakdown.
//
// Period is a human-readable label rather than echoing From / To as
// dates: it lets the LLM quote the window directly in natural-language
// answers ("from 2026-01-01 to 2026-12-31...") without needing to
// branch on null values.
//
// IncomeByCategory / ExpenseByCategory use Dictionary<string, decimal>
// because the keys are dynamic (whatever categories the user has
// recorded) and JSON-serialised to a plain object the LLM and any
// dashboard charting library can consume directly.
//
// MonthlyBreakdown is a LIST (sorted chronologically), not a
// dictionary, because order matters here — the consumer should not
// have to re-sort by parsing the YYYY-MM string. See
// MonthlyBreakdownDto for the per-row shape.
public record GetFinancialSummaryResult(
    Guid MeiId,
    string Period,
    decimal TotalIncome,
    decimal TotalExpense,
    decimal NetProfit,
    decimal ProfitMargin,
    IReadOnlyDictionary<string, decimal> IncomeByCategory,
    IReadOnlyDictionary<string, decimal> ExpenseByCategory,
    IReadOnlyList<MonthlyBreakdownDto> MonthlyBreakdown,
    IReadOnlyList<RecentTransactionDto> TopExpenses,
    IReadOnlyList<RecentTransactionDto> TopIncomes);
