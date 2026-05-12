namespace Core.Application.UseCases.Ai;

// Wire-safe transaction projection used by both AI endpoints
// (RecentTransactions in the context snapshot, TopExpenses /
// TopIncomes in the financial summary).
//
// Why one shared shape rather than three near-duplicates:
//   - All three callers want exactly the same five fields so the LLM
//     receives a consistent vocabulary across endpoints.
//   - Keeps client code (the FastAPI agent, future dashboards) able to
//     render any of these lists with the same component.
//
// Category and Description are nullable to honestly reflect the
// underlying Transaction columns (both allow NULL in Postgres).
public record RecentTransactionDto(
    string Type,
    string? Category,
    decimal Amount,
    DateOnly Date,
    string? Description);
