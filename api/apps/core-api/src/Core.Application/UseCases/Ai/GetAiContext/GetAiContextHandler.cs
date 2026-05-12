using Core.Domain.Exceptions;
using Core.Domain.Interfaces;

namespace Core.Application.UseCases.Ai.GetAiContext;

// Builds the at-a-glance context object the FastAPI agent loads at the
// start of every conversation.
//
// Read-only by design. Doesn't talk to FastAPI itself — this is the
// data the agent reads, not a wrapper around an LLM call.
public class GetAiContextHandler
{
    private readonly IMeiRepository _meiRepository;
    private readonly ITransactionRepository _transactionRepository;
    private readonly IProductRepository _productRepository;
    private readonly IEmployeeRepository _employeeRepository;

    public GetAiContextHandler(
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

    public async Task<GetAiContextResult> HandleAsync(
        GetAiContextQuery query,
        CancellationToken cancellationToken = default)
    {
        // Step 1 — Parent MEI ownership.
        // Performed BEFORE any aggregation read so a probe against
        // someone else's MEI returns 403 immediately and we don't pay
        // the cost of three repository round trips for an unauthorised
        // call.
        var mei = await _meiRepository.GetByIdAsync(query.MeiId, cancellationToken);
        if (mei is null)
            throw new MeiNotFoundException(query.MeiId);
        if (mei.UserId != query.UserId)
            throw new UnauthorizedAccessException("You do not have access to this MEI.");

        // Step 2 — Pull the source data. No date filter on transactions
        // because this endpoint is "everything we know about the MEI"
        // — the financial-summary endpoint is the one that takes a
        // window. All three repository methods already AsNoTracking,
        // so memory pressure is bounded by the row count.
        var transactions = await _transactionRepository.GetAllByMeiIdAsync(
            query.MeiId,
            from: null,
            to: null,
            type: null,
            category: null,
            cancellationToken);
        var products = await _productRepository.GetAllByMeiIdAsync(
            query.MeiId, status: null, cancellationToken);
        var employees = await _employeeRepository.GetAllByMeiIdAsync(
            query.MeiId, cancellationToken);

        // Step 3 — Money totals.
        // We split by Type with case-insensitive comparison so a row
        // that came in as "Income" (capitalised by the LLM) is still
        // counted. Anything that is neither income nor expense is
        // silently skipped — better to under-report than to surprise
        // the user with a number that doesn't match the dashboard.
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

        // Step 4 — Top 5 categories by transaction COUNT (not by
        // amount). Counting is the right signal for "what does this
        // business do most of?" — a single big-ticket sale shouldn't
        // dwarf a recurring service category that runs the operation.
        // Null/empty categories are excluded: they aren't a useful
        // grouping for the agent to ground answers on.
        var topCategories = transactions
            .Where(t => !string.IsNullOrWhiteSpace(t.Category))
            .GroupBy(t => t.Category!)
            .Select(g => new { Category = g.Key, Count = g.Count() })
            .OrderByDescending(x => x.Count)
            .Take(5)
            .Select(x => x.Category)
            .ToList();

        // Step 5 — Last 10 transactions.
        // Order by Date desc, then CreatedAt desc as a tiebreaker so
        // multiple rows on the same day get a stable, intuitive order
        // (most-recently-recorded first).
        var recentTransactions = transactions
            .OrderByDescending(t => t.Date)
            .ThenByDescending(t => t.CreatedAt)
            .Take(10)
            .Select(t => new RecentTransactionDto(
                t.Type, t.Category, t.Amount, t.Date, t.Description))
            .ToList();

        // Step 6 — Project. AnnualLimit is nullable on the entity
        // (legacy rows scaffolded from Supabase may not have it set);
        // a missing limit is reported as 0 rather than as null so the
        // wire shape stays honest to GetAiContextResult.AnnualLimit
        // (non-nullable decimal). Plan defaults to "free" for the
        // same reason — null is not a useful value for an agent to
        // reason about.
        return new GetAiContextResult(
            mei.Id,
            mei.Name,
            mei.Plan ?? "free",
            mei.AnnualLimit ?? 0m,
            totalIncome,
            totalExpense,
            netProfit,
            transactions.Count,
            products.Count,
            employees.Count,
            topCategories,
            recentTransactions);
    }
}
