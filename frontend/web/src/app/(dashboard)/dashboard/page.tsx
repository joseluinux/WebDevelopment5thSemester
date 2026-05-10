import { Suspense } from "react";
import { AlertTriangle, Brain } from "lucide-react";
import {
  transactionsService,
  MOCK_DASHBOARD_STATS,
  MOCK_CHART_DATA,
} from "@/services/transactions.service";
import { aiService } from "@/services/ai.service";
import {
  formatCurrency,
  formatPercent,
  calcAnnualLimitPercent,
} from "@/utils/formatters";
import { StatCard } from "@/app/components/ui/StatCard";
import { ProgressBar } from "@/app/components/ui/ProgressBar";
import { StatCardSkeleton } from "@/app/components/ui/Skeleton";
import { RevenueChart } from "./_components/RevenueChart";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Dashboard — LUMEMEI",
};

// SSR: dados buscados no servidor
async function getDashboardData() {
  // TODO: passar meiId real do contexto/cookie quando backend estiver pronto
  const meiId = "mei_01";
  const [stats, chartData, insights] = await Promise.all([
    transactionsService.getDashboardStats(meiId),
    transactionsService.getChartData(meiId),
    aiService.getInsights(meiId),
  ]);
  return { stats, chartData, insights };
}

export default async function DashboardPage() {
  const { stats, chartData, insights } = await getDashboardData();
  const limitPct = calcAnnualLimitPercent(
    stats.annualLimitUsed,
    stats.annualLimit,
  );

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="font-display text-display-sm font-bold text-on-surface">
          Financial Health
        </h1>
        <p className="text-on-muted text-sm mt-1">
          Real-time overview of your MEI performance.
        </p>
      </div>

      {/* MEI Annual Limit Radar */}
      <div className="bg-obsidian-card rounded-card border border-obsidian-elevated p-5">
        <div className="flex items-start gap-2 mb-3">
          <AlertTriangle className="w-4 h-4 text-status-warning mt-0.5 shrink-0" />
          <p className="text-on-muted text-xs uppercase tracking-widest font-semibold">
            MEI Annual Limit Radar
          </p>
        </div>
        <div className="flex items-baseline gap-2 mb-1">
          <span className="font-display text-2xl font-bold text-on-surface">
            {formatCurrency(stats.annualLimitUsed)}
          </span>
          <span className="text-on-muted text-sm">
            / {formatCurrency(stats.annualLimit)}
          </span>
        </div>
        <ProgressBar
          value={limitPct}
          max={100}
          color="accent"
          className="my-3"
        />
        <div className="flex justify-between text-xs text-on-muted">
          <span>Jan 1</span>
          <span>Dec 31</span>
        </div>
        {limitPct > 80 && (
          <p className="text-status-warning text-xs mt-2">
            ⚠ Approaching annual limit. {limitPct.toFixed(0)}% utilized.
            Consider transition scenarios to ME.
          </p>
        )}
      </div>

      {/* Stat Cards */}
      <Suspense
        fallback={
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <StatCardSkeleton key={i} />
            ))}
          </div>
        }
      >
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            label="Total Revenue"
            value={formatCurrency(stats.totalRevenue, { compact: true })}
            change={stats.revenueChange}
          />
          <StatCard
            label="Total Expenses"
            value={formatCurrency(stats.totalExpenses, { compact: true })}
            change={stats.expensesChange}
          />
          <StatCard
            label="Net Profit"
            value={formatCurrency(stats.netProfit, { compact: true })}
            changeLabel="YTD Cumulative"
            accent
          />
          <StatCard
            label="Operating Margin"
            value={formatPercent(stats.operatingMargin)}
            changeLabel="This period"
          />
        </div>
      </Suspense>

      {/* Chart + Oracle Insight */}
      <div className="grid lg:grid-cols-5 gap-4">
        <div className="lg:col-span-3 bg-obsidian-card rounded-card border border-obsidian-elevated p-5">
          <div className="flex items-center justify-between mb-4">
            <p className="text-on-muted text-xs uppercase tracking-widest font-semibold">
              Revenue vs Expenses (6M)
            </p>
            <button className="text-on-muted hover:text-on-surface text-lg leading-none">
              ···
            </button>
          </div>
          <RevenueChart data={chartData} />
        </div>

        {/* Oracle Insight Widget */}
        <div className="lg:col-span-2 bg-obsidian-card rounded-card border border-obsidian-elevated p-5 flex flex-col gap-4">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-accent/15 border border-accent/20 flex items-center justify-center">
              <Brain className="w-4 h-4 text-accent" />
            </div>
            <p className="text-on-surface font-semibold text-sm">
              Oracle Insight
            </p>
          </div>
          <p className="text-on-muted text-sm leading-relaxed">
            {insights.recommendations[0]?.description ??
              "Based on your current trajectory, you are highly likely to exceed the R$ 81k MEI threshold by late October."}
          </p>
          <div className="bg-obsidian-elevated rounded-lg p-4">
            <p className="text-on-muted text-xs uppercase tracking-widest font-semibold mb-2">
              Recommended Action
            </p>
            <p className="text-on-surface text-sm">
              {insights.recommendations[0]?.title ??
                "Schedule a consultation to prepare documentation for ME transition to avoid penalty taxes."}
            </p>
          </div>
          <a
            href="/dashboard/oracle-ai"
            className="flex items-center gap-2 text-accent text-sm font-semibold hover:text-accent-light transition-colors mt-auto"
          >
            View Full Analysis <span>→</span>
          </a>
        </div>
      </div>
    </div>
  );
}
