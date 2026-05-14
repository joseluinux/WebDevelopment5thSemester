using Core.Application.UseCases.Ai;
using Core.Domain.Exceptions;
using Core.Domain.Interfaces;
using Core.Infrastructure;

namespace Core.Application.UseCases.Insights.GetInsights;

// Aggregates all data needed by the Insights page in a single handler
// so the frontend makes one HTTP request instead of four.
//
// Ownership check happens first so an unauthorised call never pays the
// cost of three extra repository reads.
public class GetInsightsHandler
{
    private readonly IMeiRepository _meiRepository;
    private readonly ITransactionRepository _transactionRepository;
    private readonly IProductRepository _productRepository;
    private readonly IEmployeeRepository _employeeRepository;

    public GetInsightsHandler(
        IMeiRepository meiRepository,
        ITransactionRepository transactionRepository,
        IProductRepository productRepository,
        IEmployeeRepository employeeRepository)
    {
        _meiRepository = meiRepository;
        _transactionRepository = transactionRepository;
        _productRepository = productRepository;
        _employeeRepository = employeeRepository;
    }

    public async Task<GetInsightsResult> HandleAsync(
        GetInsightsQuery query,
        CancellationToken cancellationToken = default)
    {
        // Step 1 — Ownership guard.
        var mei = await _meiRepository.GetByIdAsync(query.MeiId, cancellationToken);
        if (mei is null)
            throw new MeiNotFoundException(query.MeiId);
        if (mei.UserId != query.UserId)
            throw new UnauthorizedAccessException("You do not have access to this MEI.");

        // Step 2 — Fetch all source data (no date filter — all-time view).
        var transactions = await _transactionRepository.GetAllByMeiIdAsync(
            query.MeiId, from: null, to: null, type: null, category: null, cancellationToken);
        var products = await _productRepository.GetAllByMeiIdAsync(
            query.MeiId, status: null, cancellationToken);
        var employees = await _employeeRepository.GetAllByMeiIdAsync(
            query.MeiId, cancellationToken);

        // Step 3 — Financial KPIs.
        decimal totalIncome = 0m, totalExpense = 0m;
        foreach (var t in transactions)
        {
            if (string.Equals(t.Type, "income", StringComparison.OrdinalIgnoreCase))
                totalIncome += t.Amount;
            else if (string.Equals(t.Type, "expense", StringComparison.OrdinalIgnoreCase))
                totalExpense += t.Amount;
        }
        var netProfit = totalIncome - totalExpense;
        var profitMargin = totalIncome == 0m ? 0m : netProfit / totalIncome * 100m;

        var annualLimit = mei.AnnualLimit ?? 81_000m;
        var limitUsedPct = annualLimit > 0m ? totalIncome / annualLimit * 100m : 0m;

        // Step 4 — Monthly breakdown (sorted chronologically by YYYY-MM key).
        var monthlyBreakdown = transactions
            .GroupBy(t => $"{t.Date.Year:D4}-{t.Date.Month:D2}")
            .Select(g =>
            {
                decimal mIncome = 0m, mExpense = 0m;
                foreach (var t in g)
                {
                    if (string.Equals(t.Type, "income", StringComparison.OrdinalIgnoreCase))
                        mIncome += t.Amount;
                    else if (string.Equals(t.Type, "expense", StringComparison.OrdinalIgnoreCase))
                        mExpense += t.Amount;
                }
                return new MonthlyBreakdownDto(g.Key, mIncome, mExpense, mIncome - mExpense);
            })
            .OrderBy(m => m.Month, StringComparer.Ordinal)
            .ToList();

        // Step 5 — Projections.
        var monthCount = monthlyBreakdown.Count;
        var avgMonthlyIncome = monthCount > 0 ? totalIncome / monthCount : 0m;
        decimal? monthsUntilLimit = avgMonthlyIncome > 0m && totalIncome < annualLimit
            ? Math.Round((annualLimit - totalIncome) / avgMonthlyIncome, 1)
            : null;

        // Step 6 — Category breakdowns (top 10 each; frontend can slice further).
        var incomeByCategory = transactions
            .Where(t => string.Equals(t.Type, "income", StringComparison.OrdinalIgnoreCase)
                     && !string.IsNullOrWhiteSpace(t.Category))
            .GroupBy(t => t.Category!)
            .OrderByDescending(g => g.Sum(t => t.Amount))
            .Take(10)
            .ToDictionary(g => g.Key, g => g.Sum(t => t.Amount));

        var expenseByCategory = transactions
            .Where(t => string.Equals(t.Type, "expense", StringComparison.OrdinalIgnoreCase)
                     && !string.IsNullOrWhiteSpace(t.Category))
            .GroupBy(t => t.Category!)
            .OrderByDescending(g => g.Sum(t => t.Amount))
            .Take(10)
            .ToDictionary(g => g.Key, g => g.Sum(t => t.Amount));

        // Step 7 — Top 5 by amount.
        static RecentTransactionDto ToDto(Transaction t) =>
            new(t.Type, t.Category, t.Amount, t.Date, t.Description);

        var topIncomes = transactions
            .Where(t => string.Equals(t.Type, "income", StringComparison.OrdinalIgnoreCase))
            .OrderByDescending(t => t.Amount).ThenByDescending(t => t.Date)
            .Take(5).Select(ToDto).ToList();

        var topExpenses = transactions
            .Where(t => string.Equals(t.Type, "expense", StringComparison.OrdinalIgnoreCase))
            .OrderByDescending(t => t.Amount).ThenByDescending(t => t.Date)
            .Take(5).Select(ToDto).ToList();

        return new GetInsightsResult(
            mei.Id,
            mei.Name,
            mei.Plan ?? "starter",
            annualLimit,
            limitUsedPct,
            totalIncome,
            totalExpense,
            netProfit,
            profitMargin,
            avgMonthlyIncome,
            monthsUntilLimit,
            transactions.Count,
            products.Count,
            employees.Count,
            monthlyBreakdown,
            incomeByCategory,
            expenseByCategory,
            topIncomes,
            topExpenses);
    }
}
