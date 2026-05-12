using System.Globalization;
using Core.Domain.Exceptions;
using Core.Domain.Interfaces;
using Core.Infrastructure;

namespace Core.Application.UseCases.Ai.GetFinancialSummary;

// Computes the financial summary for a MEI over an optional date
// window. Read-only; does not call FastAPI. The shape is what the AI
// agent consumes when the user asks period-scoped questions ("how was
// last month?", "show me Q1").
public class GetFinancialSummaryHandler
{
    private readonly IMeiRepository _meiRepository;
    private readonly ITransactionRepository _transactionRepository;

    public GetFinancialSummaryHandler(
        IMeiRepository meiRepository,
        ITransactionRepository transactionRepository)
    {
        _meiRepository = meiRepository;
        _transactionRepository = transactionRepository;
    }

    public async Task<GetFinancialSummaryResult> HandleAsync(
        GetFinancialSummaryQuery query,
        CancellationToken cancellationToken = default)
    {
        // Step 1 — Parent MEI ownership.
        // Performed BEFORE the read so a probe against someone else's
        // MEI returns 403, not an empty (and therefore information-
        // leaking) summary.
        var mei = await _meiRepository.GetByIdAsync(query.MeiId, cancellationToken);
        if (mei is null)
            throw new MeiNotFoundException(query.MeiId);
        if (mei.UserId != query.UserId)
            throw new UnauthorizedAccessException("You do not have access to this MEI.");

        // Step 2 — Pull transactions for the window. The repository
        // already does inclusive date filtering when From / To are
        // provided, so we just forward them. type / category are
        // null because we want every row to bucket by ourselves.
        var transactions = await _transactionRepository.GetAllByMeiIdAsync(
            query.MeiId,
            from: query.From,
            to: query.To,
            type: null,
            category: null,
            cancellationToken);

        // Step 3 — Money totals.
        // Same case-insensitive Type comparison as the context handler:
        // a row stored as "Income" still counts. Anything that is
        // neither income nor expense is dropped on the floor — better
        // to under-report than to surface a number the dashboard does
        // not also show.
        decimal totalIncome = 0m;
        decimal totalExpense = 0m;
        foreach (var t in transactions)
        {
            if (string.Equals(t.Type, "income", StringComparison.OrdinalIgnoreCase))
                totalIncome += t.Amount;
            else if (string.Equals(t.Type, "expense", StringComparison.OrdinalIgnoreCase))
                totalExpense += t.Amount;
        }
        var netProfit = totalIncome - totalExpense;

        // Step 4 — Profit margin.
        // Defined as NetProfit / TotalIncome * 100 (i.e. percent of
        // every R$1 of revenue that the business KEEPS). Returning 0
        // when TotalIncome is zero is a deliberate API contract: a
        // business with no income has an undefined margin, but
        // forcing every consumer to handle null/NaN is worse than the
        // small lie of "0". The handler explicitly avoids the divide
        // because decimal would throw DivideByZeroException, not
        // produce NaN like a double.
        var profitMargin = totalIncome == 0m
            ? 0m
            : netProfit / totalIncome * 100m;

        // Step 5 — Income / expense by category.
        // Two dictionaries, one per Type. Null/empty categories are
        // excluded — they aren't a useful key for a Dictionary or a
        // chart legend, and the totals already capture the sum of
        // everything (categorised + uncategorised).
        var incomeByCategory = transactions
            .Where(t => string.Equals(t.Type, "income", StringComparison.OrdinalIgnoreCase))
            .Where(t => !string.IsNullOrWhiteSpace(t.Category))
            .GroupBy(t => t.Category!)
            .ToDictionary(g => g.Key, g => g.Sum(t => t.Amount));

        var expenseByCategory = transactions
            .Where(t => string.Equals(t.Type, "expense", StringComparison.OrdinalIgnoreCase))
            .Where(t => !string.IsNullOrWhiteSpace(t.Category))
            .GroupBy(t => t.Category!)
            .ToDictionary(g => g.Key, g => g.Sum(t => t.Amount));

        // Step 6 — Monthly breakdown.
        // Bucket key is "YYYY-MM" formatted with InvariantCulture +
        // explicit zero-padding so the strings sort lexically into
        // chronological order. We compute Income / Expense in a
        // single GroupBy pass to avoid two scans of the transaction
        // list for the same month.
        var monthlyBreakdown = transactions
            .GroupBy(t => $"{t.Date.Year:D4}-{t.Date.Month:D2}")
            .Select(g =>
            {
                decimal monthIncome = 0m;
                decimal monthExpense = 0m;
                foreach (var t in g)
                {
                    if (string.Equals(t.Type, "income", StringComparison.OrdinalIgnoreCase))
                        monthIncome += t.Amount;
                    else if (string.Equals(t.Type, "expense", StringComparison.OrdinalIgnoreCase))
                        monthExpense += t.Amount;
                }
                return new MonthlyBreakdownDto(
                    g.Key,
                    monthIncome,
                    monthExpense,
                    monthIncome - monthExpense);
            })
            // The "YYYY-MM" string sorts chronologically by definition,
            // so OrderBy on the string is the cheapest correct sort.
            .OrderBy(m => m.Month, StringComparer.Ordinal)
            .ToList();

        // Step 7 — Top 5 expenses and top 5 incomes BY AMOUNT.
        // "Biggest" rows surface outliers the agent should mention
        // first ("your largest expense this month was..."). Uses
        // OrderByDescending so the largest is first. Tiebreaker on
        // Date desc keeps results stable when several rows share an
        // amount.
        var topExpenses = transactions
            .Where(t => string.Equals(t.Type, "expense", StringComparison.OrdinalIgnoreCase))
            .OrderByDescending(t => t.Amount)
            .ThenByDescending(t => t.Date)
            .Take(5)
            .Select(ToRecent)
            .ToList();

        var topIncomes = transactions
            .Where(t => string.Equals(t.Type, "income", StringComparison.OrdinalIgnoreCase))
            .OrderByDescending(t => t.Amount)
            .ThenByDescending(t => t.Date)
            .Take(5)
            .Select(ToRecent)
            .ToList();

        // Step 8 — Project. Period label is computed last so it can
        // reflect the actual filter we honoured (independent of
        // whether the user passed the values).
        return new GetFinancialSummaryResult(
            mei.Id,
            FormatPeriod(query.From, query.To),
            totalIncome,
            totalExpense,
            netProfit,
            profitMargin,
            incomeByCategory,
            expenseByCategory,
            monthlyBreakdown,
            topExpenses,
            topIncomes);
    }

    // Local helper kept on the class so the LINQ projections above
    // stay readable. Using a static method-group reference (ToRecent)
    // also avoids closure allocations.
    private static RecentTransactionDto ToRecent(Transaction t) =>
        new(t.Type, t.Category, t.Amount, t.Date, t.Description);

    // Human-readable period label used in the wire response.
    //
    // Format choices:
    //   - Both null         -> "All time"
    //   - From only         -> "From {from}"
    //   - To only           -> "Up to {to}"
    //   - From + To         -> "{from} to {to}"
    //
    // ISO-8601 ("yyyy-MM-dd") is used unconditionally so the agent
    // can quote the period in any locale without having to reformat
    // the dates.
    private static string FormatPeriod(DateOnly? from, DateOnly? to)
    {
        if (from is null && to is null) return "All time";
        if (from is not null && to is null)
            return $"From {from.Value.ToString("yyyy-MM-dd", CultureInfo.InvariantCulture)}";
        if (from is null && to is not null)
            return $"Up to {to.Value.ToString("yyyy-MM-dd", CultureInfo.InvariantCulture)}";
        return $"{from!.Value.ToString("yyyy-MM-dd", CultureInfo.InvariantCulture)} " +
               $"to {to!.Value.ToString("yyyy-MM-dd", CultureInfo.InvariantCulture)}";
    }
}
