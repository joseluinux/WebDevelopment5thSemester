import type { Metadata } from "next";

export const metadata: Metadata = { title: "Products — LUMEMEI" };

const PRODUCTS = [
  {
    id: "1",
    name: "Obsidian Node Alpha",
    sku: "ONA-2049",
    icon: "terminal",
    price: 1250,
    cost: 450,
    margin: 64,
    targetMargin: 50,
    status: "healthy",
  },
  {
    id: "2",
    name: "Quantum Core Processor",
    sku: "QCP-901",
    icon: "memory",
    price: 850,
    cost: 510,
    margin: 40,
    targetMargin: 45,
    status: "warning",
  },
  {
    id: "3",
    name: "Legacy Mesh Router",
    sku: "LMR-102",
    icon: "router",
    price: 120,
    cost: 105,
    margin: 12.5,
    targetMargin: 35,
    status: "critical",
  },
  {
    id: "4",
    name: "Aether Firewall License",
    sku: "AFL-ANNUAL",
    icon: "security",
    price: 2400,
    cost: 600,
    margin: 75,
    targetMargin: 60,
    status: "healthy",
  },
];

export default function ProductsPage() {
  return (
    <div className="space-y-12">
      {/* Header */}
      <header className="flex justify-between items-end">
        <div>
          <h1 className="font-display text-5xl text-on-surface mb-3 tracking-tighter font-medium">
            Products
          </h1>
          <p className="text-on-surface-variant font-body text-sm max-w-md">
            Profitability Analysis & Inventory Valuation Engine.
          </p>
        </div>
        <div className="flex gap-4">
          <button className="bg-surface-container-highest border border-outline-variant/15 text-on-surface px-5 py-2.5 rounded-lg hover:bg-surface-bright transition-colors font-label text-sm flex items-center gap-2">
            <span className="material-symbols-outlined text-lg">download</span>
            Export Matrix
          </button>
          <button className="bg-surface-container-highest border border-outline-variant/15 text-on-surface px-5 py-2.5 rounded-lg hover:bg-surface-bright transition-colors font-label text-sm flex items-center gap-2">
            <span className="material-symbols-outlined text-lg">
              filter_list
            </span>
            Parameters
          </button>
        </div>
      </header>

      {/* Executive Summary — Bento Grid */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Total Inventory Value */}
        <div className="bg-surface-container rounded-lg p-6 relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-10">
            <span className="material-symbols-outlined text-8xl">
              inventory_2
            </span>
          </div>
          <p className="font-label text-sm text-on-surface-variant uppercase tracking-widest mb-4">
            Total Inventory Value
          </p>
          <h2 className="font-display text-4xl text-on-surface tracking-tight">
            $4.2M
          </h2>
          <div className="mt-4 flex items-center gap-2 text-xs font-label">
            <span className="text-primary-container bg-primary-container/10 px-2 py-1 rounded flex items-center gap-1">
              <span className="material-symbols-outlined text-sm">
                trending_up
              </span>
              +12.4%
            </span>
            <span className="text-outline">vs last quarter</span>
          </div>
        </div>

        {/* Blended Margin */}
        <div className="bg-surface-container rounded-lg p-6 relative overflow-hidden">
          <p className="font-label text-sm text-on-surface-variant uppercase tracking-widest mb-4">
            Blended Margin
          </p>
          <h2 className="font-display text-4xl text-primary-container tracking-tight">
            42.8%
          </h2>
          <div className="mt-6">
            <div className="flex justify-between text-xs font-label mb-2">
              <span className="text-on-surface-variant">Current</span>
              <span className="text-outline">Target: 45.0%</span>
            </div>
            <div className="w-full h-1.5 bg-surface-container-lowest rounded-full relative overflow-hidden">
              <div className="absolute top-0 left-0 h-full bg-primary-container w-[85%] rounded-full" />
              <div
                className="absolute top-0 h-full w-0.5 bg-on-surface left-[90%] z-10"
                style={{ boxShadow: "0 0 4px rgba(255,255,255,0.5)" }}
              />
            </div>
          </div>
        </div>

        {/* Profitability Alert */}
        <div className="bg-surface-container rounded-lg p-6 relative overflow-hidden flex flex-col justify-between">
          <div>
            <p className="font-label text-sm text-on-surface-variant uppercase tracking-widest mb-4">
              Profitability Alert
            </p>
            <h2 className="font-display text-2xl text-on-surface tracking-tight leading-tight">
              12 SKUs below target margin threshold.
            </h2>
          </div>
          <button className="mt-4 text-error font-label text-sm flex items-center gap-1 hover:text-error-container transition-colors w-fit">
            Review Underperformers
            <span className="material-symbols-outlined text-base">
              arrow_forward
            </span>
          </button>
        </div>
      </section>

      {/* Product Portfolio */}
      <section>
        <div className="flex justify-between items-center mb-6 px-2">
          <h2 className="font-headline text-lg text-on-surface tracking-tight">
            Active Portfolio
          </h2>
          <span className="text-xs font-label text-on-surface-variant uppercase tracking-widest">
            Sorted by: Variance
          </span>
        </div>
        <div className="flex flex-col gap-4">
          {PRODUCTS.map((p) => {
            const marginColor =
              p.status === "critical"
                ? "text-error"
                : p.status === "warning"
                  ? "text-tertiary"
                  : "text-primary-container";
            const barColor =
              p.status === "critical"
                ? "bg-error"
                : p.status === "warning"
                  ? "bg-tertiary"
                  : "bg-primary-container";
            const barWidth = Math.min(Math.round((p.margin / 100) * 100), 100);
            const targetWidth = Math.min(p.targetMargin, 100);
            const rowBorder =
              p.status === "critical" ? "border border-error/10" : "";

            return (
              <div
                key={p.id}
                className={`bg-surface-container rounded-lg p-5 flex items-center justify-between hover:bg-surface-container-highest transition-colors duration-300 ${rowBorder}`}
              >
                {/* Product Info */}
                <div className="flex items-center gap-5 w-[30%]">
                  <div
                    className={`w-12 h-12 rounded bg-surface-container-lowest flex items-center justify-center border ${p.status === "critical" ? "border-error/20" : "border-outline-variant/15"}`}
                  >
                    <span
                      className={`material-symbols-outlined ${p.status === "critical" ? "text-error" : "text-on-surface-variant"}`}
                    >
                      {p.icon}
                    </span>
                  </div>
                  <div>
                    <h3 className="font-headline text-base text-on-surface">
                      {p.name}
                    </h3>
                    <p className="font-label text-xs text-outline tracking-wider uppercase mt-1">
                      SKU: {p.sku}
                    </p>
                  </div>
                </div>

                {/* Unit Price */}
                <div className="flex flex-col w-[20%]">
                  <span className="font-label text-xs text-on-surface-variant mb-1 uppercase tracking-wider">
                    Unit Price
                  </span>
                  <span className="font-display text-lg text-on-surface">
                    $
                    {p.price.toLocaleString("en-US", {
                      minimumFractionDigits: 2,
                    })}
                  </span>
                </div>

                {/* Unit Cost */}
                <div className="flex flex-col w-[20%]">
                  <span className="font-label text-xs text-on-surface-variant mb-1 uppercase tracking-wider">
                    Unit Cost
                  </span>
                  <span className="font-display text-lg text-outline">
                    $
                    {p.cost.toLocaleString("en-US", {
                      minimumFractionDigits: 2,
                    })}
                  </span>
                </div>

                {/* Margin */}
                <div className="flex flex-col w-[25%]">
                  <div className="flex justify-between items-end mb-2">
                    <span className={`font-display text-xl ${marginColor}`}>
                      {p.margin}%
                    </span>
                    <span
                      className={`font-label text-[10px] uppercase tracking-wider ${p.status === "critical" ? "text-error" : "text-outline"}`}
                    >
                      Target: {p.targetMargin}%
                    </span>
                  </div>
                  <div className="w-full h-1.5 bg-surface-container-lowest rounded-full relative overflow-hidden">
                    <div
                      className={`absolute top-0 left-0 h-full ${barColor} rounded-full`}
                      style={{ width: `${barWidth}%` }}
                    />
                    <div
                      className="absolute top-0 h-full w-0.5 bg-on-surface opacity-60 z-10"
                      style={{ left: `${targetWidth}%` }}
                    />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}
