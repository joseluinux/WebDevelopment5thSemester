import { aiService } from "@/services/ai.service";
import { formatCurrency, formatPercent } from "@/utils/formatters";
import { cn } from "@/lib/cn";
import type { Metadata } from "next";
import type { OracleRecommendation } from "@/types";

export const metadata: Metadata = { title: "Insights — LUMEMEI" };

async function getInsights() {
  return aiService.getInsights("mei_01");
}

export default async function InsightsPage() {
  const insights = await getInsights();

  const tagColors: Record<string, string> = {
    ACTIONABLE:
      "bg-status-success/15 text-status-success border-status-success/30",
    "HIGH PRIORITY":
      "bg-status-error/15 text-status-error border-status-error/30",
    STRATEGIC: "bg-accent/15 text-accent border-accent/30",
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="font-display text-display-sm font-bold text-on-surface">
          Insights
        </h1>
        <p className="text-on-muted text-sm mt-1">
          Oracle AI-powered intelligence on your business health.
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-obsidian-card rounded-card border border-obsidian-elevated p-5">
          <p className="text-on-muted text-xs uppercase tracking-widest font-semibold mb-2">
            Projected Revenue (12m)
          </p>
          <p className="font-display text-2xl font-bold text-status-success">
            {formatCurrency(insights.projectedRevenue, { compact: true })}
          </p>
          <p className="text-status-success text-xs mt-1">
            ↗ +{insights.projectedRevenueChange}% vs current run-rate
          </p>
        </div>

        <div className="bg-obsidian-card rounded-card border border-obsidian-elevated p-5">
          <p className="text-on-muted text-xs uppercase tracking-widest font-semibold mb-2">
            Cost Anomalies
          </p>
          <p className="font-display text-2xl font-bold text-status-error">
            {insights.costAnomalies}
          </p>
          <p
            className={cn(
              "text-xs mt-1 font-semibold",
              insights.costAnomaliesSeverity === "high"
                ? "text-status-error"
                : "text-status-warning",
            )}
          >
            {insights.costAnomaliesSeverity.toUpperCase()} SEVERITY — review
            required
          </p>
        </div>

        <div className="bg-obsidian-card rounded-card border border-obsidian-elevated p-5">
          <p className="text-on-muted text-xs uppercase tracking-widest font-semibold mb-2">
            System Efficiency
          </p>
          <p className="font-display text-2xl font-bold text-accent">
            {insights.systemEfficiency}%
          </p>
          <div className="mt-2 w-full h-1.5 bg-obsidian-elevated rounded-full overflow-hidden">
            <div
              className="h-full bg-accent rounded-full"
              style={{ width: `${insights.systemEfficiency}%` }}
            />
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-5 gap-6">
        {/* Revenue vs Burn Rate Chart */}
        <div className="lg:col-span-3 bg-obsidian-card rounded-card border border-obsidian-elevated p-5">
          <p className="text-on-surface font-semibold mb-4">
            Revenue vs Burn Rate
          </p>
          <div className="h-52 flex items-end gap-3">
            {insights.chartData.map((d) => {
              const max = Math.max(...insights.chartData.map((x) => x.revenue));
              const revH = (d.revenue / max) * 100;
              const burnH = (d.burnRate / max) * 100;
              return (
                <div
                  key={d.month}
                  className="flex-1 flex flex-col items-center gap-1"
                >
                  <div
                    className="w-full flex gap-1 items-end"
                    style={{ height: "180px" }}
                  >
                    <div
                      className="flex-1 rounded-t bg-accent/60 hover:bg-accent transition-colors"
                      style={{ height: `${revH}%` }}
                      title={`Revenue: ${formatCurrency(d.revenue)}`}
                    />
                    <div
                      className="flex-1 rounded-t bg-status-error/40 hover:bg-status-error/60 transition-colors"
                      style={{ height: `${burnH}%` }}
                      title={`Burn: ${formatCurrency(d.burnRate)}`}
                    />
                  </div>
                  <p className="text-on-muted text-xs">{d.month}</p>
                </div>
              );
            })}
          </div>
          <div className="flex items-center gap-4 mt-3 pt-3 border-t border-obsidian-elevated">
            <span className="flex items-center gap-1.5 text-xs text-on-muted">
              <span className="w-2 h-2 rounded-full bg-accent inline-block" />
              Revenue
            </span>
            <span className="flex items-center gap-1.5 text-xs text-on-muted">
              <span className="w-2 h-2 rounded-full bg-status-error/60 inline-block" />
              Burn Rate
            </span>
          </div>
        </div>

        {/* Oracle Recommendations */}
        <div className="lg:col-span-2 space-y-3">
          <p className="text-on-surface font-semibold">
            Oracle Recommendations
          </p>
          {insights.recommendations.map((rec) => (
            <RecommendationCard key={rec.id} rec={rec} tagColors={tagColors} />
          ))}
        </div>
      </div>

      {/* Q3 Executive Synopsis */}
      <div className="bg-obsidian-card rounded-card border border-obsidian-elevated p-6">
        <div className="flex items-center gap-2 mb-3">
          <span className="text-xs font-bold bg-accent/15 text-accent border border-accent/30 px-2 py-0.5 rounded">
            ORACLE AI • Q3 SYNOPSIS
          </span>
        </div>
        <p className="text-on-surface font-semibold text-base mb-2">
          Q3 Executive Summary
        </p>
        <p className="text-on-muted text-sm leading-relaxed">
          O período demonstrou crescimento consistente de receita (+18% vs Q2),
          impulsionado principalmente pela expansão de clientes enterprise. A
          queima operacional se manteve controlada, com redução de 12% nos
          custos de infraestrutura após otimizações de cloud. Pontos de atenção
          incluem 3 anomalias de custos identificadas pelo Oracle AI — 2
          relacionadas a duplicidade de cobranças de fornecedores e 1 a variação
          cambial não-hedgeada. Recomenda-se ação imediata nos itens
          classificados como HIGH PRIORITY antes do fechamento trimestral.
        </p>
        <button className="mt-4 text-accent text-sm font-semibold hover:text-accent-light transition-colors">
          Generate Full Report (PDF) →
        </button>
      </div>
    </div>
  );
}

function RecommendationCard({
  rec,
  tagColors,
}: {
  rec: OracleRecommendation;
  tagColors: Record<string, string>;
}) {
  return (
    <div className="bg-obsidian-card rounded-card border border-obsidian-elevated p-4 hover:border-obsidian-highest transition-colors">
      <span
        className={cn(
          "inline-block text-xs font-bold px-2 py-0.5 rounded border mb-2",
          tagColors[rec.tag] ?? "bg-obsidian-elevated text-on-muted",
        )}
      >
        {rec.tag}
      </span>
      <p className="text-on-surface font-semibold text-sm">{rec.title}</p>
      <p className="text-on-muted text-xs mt-1 leading-relaxed">
        {rec.description}
      </p>
      {rec.link && (
        <button className="mt-2 text-accent text-xs hover:text-accent-light transition-colors">
          View Details →
        </button>
      )}
    </div>
  );
}
