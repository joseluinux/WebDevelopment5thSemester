using Core.Application.UseCases.Ai;

namespace Core.Application.UseCases.Insights.GetInsights;

// Single-call snapshot that gives the Insights page everything it needs
// without requiring multiple round-trips from the frontend.
//
// Reuses MonthlyBreakdownDto and RecentTransactionDto from the Ai
// namespace — both are LLM-friendly projections that also happen to be
// exactly what chart components want.
//
// AnnualLimitUsedPct, MonthlyAvgIncome, and MonthsUntilLimit are
// precomputed server-side so the UI never has to do arithmetic.
public record GetInsightsResult(
    Guid MeiId,
    string MeiName,
    string Plan,
    decimal AnnualLimit,
    decimal AnnualLimitUsedPct,

    decimal TotalIncome,
    decimal TotalExpense,
    decimal NetProfit,
    decimal ProfitMargin,

    // Projections
    decimal MonthlyAvgIncome,
    decimal? MonthsUntilLimit,   // null when income == 0 or limit already exceeded

    int TransactionCount,
    int ProductCount,
    int EmployeeCount,

    IReadOnlyList<MonthlyBreakdownDto> MonthlyBreakdown,
    IReadOnlyDictionary<string, decimal> IncomeByCategory,
    IReadOnlyDictionary<string, decimal> ExpenseByCategory,
    IReadOnlyList<RecentTransactionDto> TopIncomes,
    IReadOnlyList<RecentTransactionDto> TopExpenses);
