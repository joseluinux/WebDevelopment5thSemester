using Core.Infrastructure;

namespace Core.Application.UseCases.Products;

// Wire-safe projection of the Product entity, shared by every product use
// case (GetProducts, GetProduct, CreateProduct, UpdateProduct).
//
// Why a dedicated DTO rather than serializing the entity directly:
// Product has a `Mei` navigation, and Mei -> User -> PasswordHash. If we
// ever returned the entity straight to the wire, every product response
// would risk leaking credentials. A narrow DTO makes that whole class of
// bug impossible.
//
// Calculated fields:
//   Margin               — gross margin in PERCENT, computed from
//                          (Price - Cost) / Price * 100. NEVER stored in
//                          the database; recomputed on every read so it
//                          can never drift from Cost/Price.
//   IsMarginBelowDesired — convenience flag = (Margin < DesiredMargin).
//                          Lets the front-end colour-code rows without
//                          duplicating the comparison.
//
// Cost / Price / DesiredMargin / Status are kept nullable to honestly
// reflect the entity (the Postgres columns allow NULL — legacy rows
// scaffolded from Supabase). Margin/IsMarginBelowDesired are non-nullable
// because the handler always supplies a sensible default (0/false) when
// inputs are missing — see ProductMapper.
public record ProductResult(
    Guid Id,
    Guid MeiId,
    string Name,
    decimal? Cost,
    decimal? Price,
    decimal? DesiredMargin,
    string? Status,
    DateTime CreatedAt,
    DateTime? UpdatedAt,
    decimal Margin,
    bool IsMarginBelowDesired);

// Tiny pure helper that owns the ProductResult projection.
//
// Centralising it means every handler computes Margin the SAME way — if
// the formula ever changes (e.g. switching to net margin, or accounting
// for taxes), exactly ONE place needs to change. Drift between handlers
// would otherwise be invisible until a financial report disagreed with
// itself.
internal static class ProductMapper
{
    public static ProductResult ToResult(Product product)
    {
        var (margin, isBelow) = CalculateMargin(product.Cost, product.Price, product.DesiredMargin);
        return new ProductResult(
            product.Id,
            product.MeiId,
            product.Name,
            product.Cost,
            product.Price,
            product.DesiredMargin,
            product.Status,
            product.CreatedAt,
            product.UpdatedAt,
            margin,
            isBelow);
    }

    // GROSS-MARGIN FORMULA (in percent):
    //   margin = (Price - Cost) / Price * 100
    //
    // Why margin is RELATIVE to Price (not to Cost): margin tells the user
    // "what fraction of revenue you keep after covering cost", which is
    // the standard accounting definition. Dividing by Cost would give
    // mark-up, which is a different and often misleading metric.
    //
    // Edge cases (defensive — Create/Update reject most of these, but
    // existing rows from Supabase may have nulls):
    //   - Price null or <= 0  -> margin = 0, isBelow = false
    //     (we cannot meaningfully compute, and refusing to display a row
    //      because of a legacy null would be worse UX than a 0).
    //   - Cost null            -> treat as 0 (margin = 100%).
    //   - DesiredMargin null   -> isBelow = false (no target to be below of).
    public static (decimal Margin, bool IsBelow) CalculateMargin(
        decimal? cost, decimal? price, decimal? desiredMargin)
    {
        if (price is null || price <= 0)
            return (0m, false);

        var safeCost = cost ?? 0m;
        var margin = (price.Value - safeCost) / price.Value * 100m;

        var isBelow = desiredMargin is not null && margin < desiredMargin.Value;
        return (margin, isBelow);
    }
}
