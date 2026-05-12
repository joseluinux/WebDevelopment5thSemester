namespace Core.Application.UseCases.Ai;

// One row of the per-month financial breakdown.
//
// Month is formatted as "YYYY-MM" (zero-padded, invariant) so the LLM
// and any UI grouping code can sort lexically and get chronological
// order for free — no date parsing required on the consumer side.
//
// NetProfit is precomputed here rather than left for the caller to
// derive. Computing it server-side guarantees the same rounding rules
// across every consumer and saves the LLM from doing arithmetic the
// API can do faster and more reliably.
public record MonthlyBreakdownDto(
    string Month,
    decimal Income,
    decimal Expense,
    decimal NetProfit);
