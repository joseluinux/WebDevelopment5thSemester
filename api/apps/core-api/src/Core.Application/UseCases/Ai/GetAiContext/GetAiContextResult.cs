namespace Core.Application.UseCases.Ai.GetAiContext;

// Single-shot context snapshot fed to the FastAPI AI agent.
//
// The shape is intentionally LLM-friendly:
//   - Plain scalars and short lists, no nested objects beyond what
//     RecentTransactions needs. Easier for the model to reason over and
//     cheaper to serialise into a prompt.
//   - Aggregates (TotalIncome, NetProfit) are precomputed so the model
//     does not have to do arithmetic — that is a known weakness of
//     LLMs and a cheap one for the API to cover.
//   - TopCategories is a flat list of names rather than a list of
//     (name, count) pairs because the count is implicit ("top 5") and
//     the model only needs the labels to ground its answers.
//
// MeiName / Plan / AnnualLimit travel along so the agent can write
// answers like "your free plan caps at R$81,000/year and you've
// invoiced R$..." without a separate lookup.
public record GetAiContextResult(
    Guid MeiId,
    string MeiName,
    string Plan,
    decimal AnnualLimit,
    decimal TotalIncome,
    decimal TotalExpense,
    decimal NetProfit,
    int TransactionCount,
    int ProductCount,
    int EmployeeCount,
    IReadOnlyList<string> TopCategories,
    IReadOnlyList<RecentTransactionDto> RecentTransactions);
