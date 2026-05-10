import { productsService } from "@/services/products.service";
import {
  formatCurrency,
  formatPercent,
  calculateMargin,
} from "@/utils/formatters";
import { cn } from "@/lib/cn";
import type { Metadata } from "next";
import type { Product } from "@/types";

export const metadata: Metadata = { title: "Products — LUMEMEI" };

async function getProducts() {
  return productsService.getAll("mei_01");
}

export default async function ProductsPage() {
  const products = await getProducts();

  const totalInventoryValue = products.reduce(
    (sum, p) => sum + (p.price ?? 0),
    0,
  );

  const margins = products
    .filter((p) => p.price && p.cost)
    .map((p) => calculateMargin(p.price!, p.cost!));
  const blendedMargin =
    margins.length > 0
      ? margins.reduce((s, m) => s + m, 0) / margins.length
      : 0;

  const belowTarget = products.filter((p) => {
    if (!p.price || !p.cost || !p.desired_margin) return false;
    return calculateMargin(p.price, p.cost) < p.desired_margin;
  });

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="font-display text-display-sm font-bold text-on-surface">
            Products
          </h1>
          <p className="text-on-muted text-sm mt-1">
            Profitability Analysis & Inventory Valuation Engine.
          </p>
        </div>
        <div className="flex gap-2">
          <button className="px-4 py-2 rounded-lg border border-obsidian-elevated text-on-muted hover:text-on-surface text-sm transition-colors">
            ↓ Export Matrix
          </button>
          <button className="px-4 py-2 rounded-lg border border-obsidian-elevated text-on-muted hover:text-on-surface text-sm transition-colors">
            ≡ Parameters
          </button>
        </div>
      </div>

      {/* Header stats */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-obsidian-card rounded-card border border-obsidian-elevated p-5">
          <p className="text-on-muted text-xs uppercase tracking-widest font-semibold mb-2">
            Total Inventory Value
          </p>
          <p className="font-display text-2xl font-bold text-on-surface">
            {formatCurrency(totalInventoryValue, { compact: true })}
          </p>
          <p className="text-status-success text-xs mt-1">
            ↗ +12.4% vs last quarter
          </p>
        </div>

        <div className="bg-obsidian-card rounded-card border border-obsidian-elevated p-5">
          <p className="text-on-muted text-xs uppercase tracking-widest font-semibold mb-2">
            Blended Margin
          </p>
          <p className="font-display text-2xl font-bold text-accent">
            {formatPercent(blendedMargin)}
          </p>
          <div className="mt-2 flex items-center gap-2 text-xs text-on-muted">
            <div className="flex-1 h-1.5 rounded-full bg-obsidian-elevated overflow-hidden">
              <div
                className="h-full bg-accent rounded-full"
                style={{ width: `${Math.min(blendedMargin, 100)}%` }}
              />
            </div>
            <span>Target: 45.0%</span>
          </div>
        </div>

        <div className="bg-obsidian-card rounded-card border border-obsidian-elevated p-5">
          <p className="text-on-muted text-xs uppercase tracking-widest font-semibold mb-2">
            Profitability Alert
          </p>
          {belowTarget.length > 0 ? (
            <>
              <p className="font-display text-xl font-bold text-on-surface">
                {belowTarget.length} SKUs below target margin threshold.
              </p>
              <button className="text-status-warning text-xs mt-1 hover:text-status-warning/80 transition-colors">
                Review Underperformers →
              </button>
            </>
          ) : (
            <p className="text-status-success text-sm font-semibold">
              All products above target margin.
            </p>
          )}
        </div>
      </div>

      {/* Product Portfolio */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <p className="text-on-surface font-semibold">Active Portfolio</p>
          <p className="text-on-muted text-xs uppercase tracking-widest">
            Sorted by: Variance
          </p>
        </div>
        <div className="space-y-2">
          {products.map((p) => (
            <ProductRow key={p.id} product={p} />
          ))}
        </div>
      </div>
    </div>
  );
}

function ProductRow({ product }: { product: Product }) {
  const margin =
    product.price && product.cost
      ? calculateMargin(product.price, product.cost)
      : null;
  const target = product.desired_margin ?? 40;
  const isBelowTarget = margin !== null && margin < target;

  const barColor =
    margin === null
      ? "bg-obsidian-highest"
      : margin < 20
        ? "bg-status-error"
        : isBelowTarget
          ? "bg-status-warning"
          : "bg-accent";

  return (
    <div className="flex items-center gap-4 bg-obsidian-card rounded-card border border-obsidian-elevated px-4 py-4 hover:border-obsidian-highest transition-colors">
      {/* Icon */}
      <div className="w-10 h-10 rounded-xl bg-obsidian-elevated flex items-center justify-center text-on-muted text-lg shrink-0">
        📦
      </div>

      {/* Name */}
      <div className="flex-1 min-w-0">
        <p className="text-on-surface font-semibold text-sm">{product.name}</p>
        <p className="text-on-muted text-xs">SKU: {product.id.toUpperCase()}</p>
      </div>

      {/* Price */}
      <div className="text-right">
        <p className="text-on-muted text-xs uppercase tracking-wider">
          Unit Price
        </p>
        <p className="text-on-surface font-semibold text-sm">
          {product.price ? formatCurrency(product.price) : "—"}
        </p>
      </div>

      {/* Cost */}
      <div className="text-right">
        <p className="text-on-muted text-xs uppercase tracking-wider">
          Unit Cost
        </p>
        <p className="text-on-surface font-semibold text-sm">
          {product.cost ? formatCurrency(product.cost) : "—"}
        </p>
      </div>

      {/* Margin bar */}
      <div className="w-36">
        {margin !== null ? (
          <div>
            <div className="flex items-center justify-between mb-1">
              <p
                className={cn(
                  "font-bold text-sm",
                  barColor.replace("bg-", "text-"),
                )}
              >
                {formatPercent(margin)}
              </p>
              <p className="text-on-muted text-xs">TARGET: {target}%</p>
            </div>
            <div className="relative h-1.5 bg-obsidian-elevated rounded-full overflow-visible">
              <div
                className={cn("h-full rounded-full", barColor)}
                style={{ width: `${Math.min(margin, 100)}%` }}
              />
              {/* target marker */}
              <div
                className="absolute top-1/2 -translate-y-1/2 w-0.5 h-3 bg-obsidian-highest"
                style={{ left: `${Math.min(target, 100)}%` }}
              />
            </div>
          </div>
        ) : (
          <p className="text-on-muted text-xs">N/A</p>
        )}
      </div>
    </div>
  );
}
