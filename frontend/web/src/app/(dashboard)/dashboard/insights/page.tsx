"use client";

import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { useMeiContext } from "@/contexts/MeiContext";
import { useInsights } from "@/hooks/useInsights";
import { formatCurrency } from "@/utils/formatters";
import type {
  InsightsMonthlyBreakdown,
  InsightsTransactionItem,
} from "@/types";

// ─── Helpers ──────────────────────────────────────────────────────────────────

/** "2025-01" → "Jan/25" (locale pt-BR) */
function formatMonth(key: string): string {
  const [year, month] = key.split("-");
  const d = new Date(parseInt(year), parseInt(month) - 1, 1);
  const mon = d
    .toLocaleDateString("pt-BR", { month: "short" })
    .replace(".", "");
  const yr = String(parseInt(year)).slice(2);
  return `${mon.charAt(0).toUpperCase() + mon.slice(1)}/${yr}`;
}

function getLimitColor(pct: number): string {
  if (pct >= 100) return "text-error";
  if (pct >= 80) return "text-orange-400";
  if (pct >= 60) return "text-yellow-400";
  return "text-green-400";
}

function getLimitBarColor(pct: number): string {
  if (pct >= 100) return "bg-error";
  if (pct >= 80) return "bg-orange-400";
  if (pct >= 60) return "bg-yellow-400";
  return "bg-green-400";
}

// ─── KPI Card ─────────────────────────────────────────────────────────────────

function KpiCard({
  label,
  value,
  icon,
  accent,
}: {
  label: string;
  value: string;
  icon: string;
  accent: string;
}) {
  return (
    <div className="bg-surface-container rounded-2xl p-5 border border-outline-variant/10 flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <p className="text-xs text-on-surface-variant font-medium uppercase tracking-wide">
          {label}
        </p>
        <span
          className={`material-symbols-outlined text-xl ${accent}`}
          style={{ fontVariationSettings: "'FILL' 1" }}
        >
          {icon}
        </span>
      </div>
      <p className={`text-2xl font-bold tracking-tight ${accent}`}>{value}</p>
    </div>
  );
}

// ─── Custom Chart Tooltip ─────────────────────────────────────────────────────

interface TooltipEntry {
  dataKey?: string | number;
  name?: string | number;
  value?: number;
  color?: string;
}

function ChartTooltip({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: TooltipEntry[];
  label?: string;
}) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-surface-container-high border border-outline-variant/20 rounded-xl p-3 shadow-xl text-sm">
      <p className="text-on-surface-variant text-xs mb-2">{label}</p>
      {payload.map((p) => (
        <div key={String(p.dataKey)} className="flex items-center gap-2">
          <span
            className="w-2 h-2 rounded-full"
            style={{ background: p.color }}
          />
          <span className="text-on-surface-variant">
            {p.name === "income" ? "Receita" : "Despesa"}:
          </span>
          <span className="text-on-surface font-semibold ml-auto pl-4">
            {formatCurrency(p.value ?? 0)}
          </span>
        </div>
      ))}
    </div>
  );
}

// ─── Category Bar ─────────────────────────────────────────────────────────────

function CategoryBar({
  label,
  amount,
  maxAmount,
  barColor,
}: {
  label: string;
  amount: number;
  maxAmount: number;
  barColor: string;
}) {
  const pct = maxAmount > 0 ? (amount / maxAmount) * 100 : 0;
  return (
    <div className="flex flex-col gap-1">
      <div className="flex items-center justify-between text-sm">
        <span className="text-on-surface truncate max-w-[60%]">{label}</span>
        <span className="text-on-surface-variant font-medium tabular-nums">
          {formatCurrency(amount, { compact: true })}
        </span>
      </div>
      <div className="h-1.5 bg-outline-variant/20 rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-700 ${barColor}`}
          style={{ width: `${Math.min(pct, 100)}%` }}
        />
      </div>
    </div>
  );
}

// ─── Transaction Row ──────────────────────────────────────────────────────────

function TransactionRow({ tx }: { tx: InsightsTransactionItem }) {
  const isIncome = tx.type === "income";
  return (
    <div className="flex items-center gap-3 py-2.5 border-b border-outline-variant/10 last:border-0">
      <div
        className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${
          isIncome ? "bg-green-400/10" : "bg-red-400/10"
        }`}
      >
        <span
          className={`material-symbols-outlined text-base ${
            isIncome ? "text-green-400" : "text-red-400"
          }`}
          style={{ fontVariationSettings: "'FILL' 1" }}
        >
          {isIncome ? "arrow_upward" : "arrow_downward"}
        </span>
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm text-on-surface truncate">
          {tx.description || tx.category || (isIncome ? "Receita" : "Despesa")}
        </p>
        {tx.category && tx.description && (
          <p className="text-xs text-on-surface-variant">{tx.category}</p>
        )}
      </div>
      <span
        className={`text-sm font-semibold tabular-nums shrink-0 ${
          isIncome ? "text-green-400" : "text-red-400"
        }`}
      >
        {formatCurrency(tx.amount, { compact: true })}
      </span>
    </div>
  );
}

// ─── Loading Skeleton ─────────────────────────────────────────────────────────

function Skeleton({ className }: { className?: string }) {
  return (
    <div
      className={`animate-pulse bg-surface-container-high rounded-xl ${className}`}
    />
  );
}

function LoadingSkeleton() {
  return (
    <div className="space-y-6">
      <Skeleton className="h-8 w-48" />
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {[0, 1, 2, 3].map((i) => (
          <Skeleton key={i} className="h-28" />
        ))}
      </div>
      <Skeleton className="h-16" />
      <Skeleton className="h-64" />
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <Skeleton className="h-56" />
        <Skeleton className="h-56" />
      </div>
    </div>
  );
}

// ─── Error State ─────────────────────────────────────────────────────────────

function ErrorState({
  message,
  onRetry,
}: {
  message?: string;
  onRetry: () => void;
}) {
  return (
    <div className="flex flex-col items-center justify-center gap-4 py-24 text-center">
      <span
        className="material-symbols-outlined text-5xl text-error/60"
        style={{ fontVariationSettings: "'FILL' 1" }}
      >
        error
      </span>
      <p className="text-on-surface font-medium">Erro ao carregar insights</p>
      <p className="text-sm text-on-surface-variant max-w-xs">
        {message ??
          "Não foi possível conectar à API. Verifique se o servidor está rodando."}
      </p>
      <button
        onClick={onRetry}
        className="mt-2 px-5 py-2.5 prism-gradient text-[#002979] font-bold text-sm rounded-lg hover:brightness-110 active:scale-95 transition-all cursor-pointer"
      >
        Tentar novamente
      </button>
    </div>
  );
}

// ─── Empty State ──────────────────────────────────────────────────────────────

function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center gap-4 py-24 text-center">
      <span
        className="material-symbols-outlined text-5xl text-on-surface-variant/40"
        style={{ fontVariationSettings: "'FILL' 1" }}
      >
        insert_chart
      </span>
      <p className="text-on-surface font-medium">Nenhum dado disponível</p>
      <p className="text-sm text-on-surface-variant max-w-xs">
        Registre transações, produtos ou funcionários para visualizar os
        insights do seu MEI.
      </p>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function InsightsPage() {
  const { activeMei, isMeisLoading } = useMeiContext();
  const {
    data: insights,
    isLoading,
    isError,
    error,
    refetch,
  } = useInsights(activeMei?.id ?? "");

  if (isMeisLoading || isLoading) return <LoadingSkeleton />;

  if (isError) {
    const msg =
      (error as { response?: { data?: { error?: string } } })?.response?.data
        ?.error ?? (error as Error)?.message;
    return <ErrorState message={msg} onRetry={() => void refetch()} />;
  }

  if (!insights) return <EmptyState />;

  const limitPct = Math.min(insights.annualLimitUsedPct, 100);
  const limitColor = getLimitColor(insights.annualLimitUsedPct);
  const limitBarColor = getLimitBarColor(insights.annualLimitUsedPct);

  const chartData = insights.monthlyBreakdown.map(
    (m: InsightsMonthlyBreakdown) => ({
      name: formatMonth(m.month),
      income: m.income,
      expense: m.expense,
    }),
  );

  const topExpenseEntries = Object.entries(insights.expenseByCategory).slice(
    0,
    5,
  );
  const topIncomeEntries = Object.entries(insights.incomeByCategory).slice(
    0,
    5,
  );
  const maxExpense = topExpenseEntries[0]?.[1] ?? 1;
  const maxIncome = topIncomeEntries[0]?.[1] ?? 1;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-on-surface">
          {insights.meiName}
        </h1>
        <p className="text-sm text-on-surface-variant mt-1">
          Visão geral financeira · Plano{" "}
          <span className="capitalize font-medium text-primary">
            {insights.plan}
          </span>
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <KpiCard
          label="Receita Total"
          value={formatCurrency(insights.totalIncome, { compact: true })}
          icon="trending_up"
          accent="text-green-400"
        />
        <KpiCard
          label="Despesa Total"
          value={formatCurrency(insights.totalExpense, { compact: true })}
          icon="trending_down"
          accent="text-red-400"
        />
        <KpiCard
          label="Lucro Líquido"
          value={formatCurrency(insights.netProfit, { compact: true })}
          icon="account_balance_wallet"
          accent={insights.netProfit >= 0 ? "text-green-400" : "text-error"}
        />
        <KpiCard
          label="Margem de Lucro"
          value={`${insights.profitMargin.toFixed(1)}%`}
          icon="donut_large"
          accent={insights.profitMargin >= 0 ? "text-primary" : "text-error"}
        />
      </div>

      {/* MEI Annual Limit */}
      <div className="bg-surface-container rounded-2xl p-5 border border-outline-variant/10">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <span
              className="material-symbols-outlined text-xl text-on-surface-variant"
              style={{ fontVariationSettings: "'FILL' 1" }}
            >
              speed
            </span>
            <p className="font-semibold text-on-surface">Limite Anual MEI</p>
          </div>
          <span className={`text-sm font-bold tabular-nums ${limitColor}`}>
            {insights.annualLimitUsedPct.toFixed(1)}% utilizado
          </span>
        </div>

        <div className="h-3 bg-outline-variant/20 rounded-full overflow-hidden mb-3">
          <div
            className={`h-full rounded-full transition-all duration-700 ${limitBarColor}`}
            style={{ width: `${limitPct}%` }}
          />
        </div>

        <div className="flex items-center justify-between text-sm text-on-surface-variant">
          <span>
            {formatCurrency(insights.totalIncome, { compact: true })} de{" "}
            {formatCurrency(insights.annualLimit, { compact: true })}
          </span>
          {insights.monthsUntilLimit != null ? (
            <span>
              ~{insights.monthsUntilLimit}{" "}
              {insights.monthsUntilLimit === 1 ? "mês" : "meses"} para atingir o
              limite
            </span>
          ) : insights.annualLimitUsedPct >= 100 ? (
            <span className="text-error font-medium">Limite atingido</span>
          ) : (
            <span>Sem projeção disponível</span>
          )}
        </div>

        <div className="grid grid-cols-3 gap-4 mt-4 pt-4 border-t border-outline-variant/10">
          <div className="text-center">
            <p className="text-xs text-on-surface-variant mb-1">Transações</p>
            <p className="text-lg font-bold text-on-surface">
              {insights.transactionCount}
            </p>
          </div>
          <div className="text-center">
            <p className="text-xs text-on-surface-variant mb-1">Produtos</p>
            <p className="text-lg font-bold text-on-surface">
              {insights.productCount}
            </p>
          </div>
          <div className="text-center">
            <p className="text-xs text-on-surface-variant mb-1">Funcionários</p>
            <p className="text-lg font-bold text-on-surface">
              {insights.employeeCount}
            </p>
          </div>
        </div>
      </div>

      {/* Monthly Trend Chart */}
      {chartData.length > 0 && (
        <div className="bg-surface-container rounded-2xl p-5 border border-outline-variant/10">
          <div className="flex items-center gap-2 mb-4">
            <span
              className="material-symbols-outlined text-xl text-on-surface-variant"
              style={{ fontVariationSettings: "'FILL' 1" }}
            >
              show_chart
            </span>
            <p className="font-semibold text-on-surface">Tendência Mensal</p>
          </div>

          <div className="flex items-center gap-6 mb-4 text-sm">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-[#4ade80]" />
              <span className="text-on-surface-variant">Receita</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-[#f87171]" />
              <span className="text-on-surface-variant">Despesa</span>
            </div>
          </div>

          <ResponsiveContainer width="100%" height={220}>
            <AreaChart
              data={chartData}
              margin={{ top: 4, right: 8, left: 0, bottom: 0 }}
            >
              <defs>
                <linearGradient id="incomeGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#4ade80" stopOpacity={0.25} />
                  <stop offset="95%" stopColor="#4ade80" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="expenseGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#f87171" stopOpacity={0.25} />
                  <stop offset="95%" stopColor="#f87171" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="rgba(255,255,255,0.05)"
              />
              <XAxis
                dataKey="name"
                tick={{ fill: "#9ca3af", fontSize: 11 }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                tickFormatter={(v: number) =>
                  formatCurrency(v, { compact: true })
                }
                tick={{ fill: "#9ca3af", fontSize: 11 }}
                axisLine={false}
                tickLine={false}
                width={72}
              />
              <Tooltip content={<ChartTooltip />} />
              <Area
                type="monotone"
                dataKey="income"
                name="income"
                stroke="#4ade80"
                strokeWidth={2}
                fill="url(#incomeGrad)"
                dot={false}
                activeDot={{ r: 4, strokeWidth: 0 }}
              />
              <Area
                type="monotone"
                dataKey="expense"
                name="expense"
                stroke="#f87171"
                strokeWidth={2}
                fill="url(#expenseGrad)"
                dot={false}
                activeDot={{ r: 4, strokeWidth: 0 }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Category Breakdown */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {topExpenseEntries.length > 0 && (
          <div className="bg-surface-container rounded-2xl p-5 border border-outline-variant/10">
            <div className="flex items-center gap-2 mb-4">
              <span
                className="material-symbols-outlined text-xl text-red-400"
                style={{ fontVariationSettings: "'FILL' 1" }}
              >
                arrow_downward
              </span>
              <p className="font-semibold text-on-surface">
                Categorias de Despesa
              </p>
            </div>
            <div className="space-y-3">
              {topExpenseEntries.map(([cat, amount]) => (
                <CategoryBar
                  key={cat}
                  label={cat}
                  amount={amount}
                  maxAmount={maxExpense}
                  barColor="bg-red-400"
                />
              ))}
            </div>
          </div>
        )}

        {topIncomeEntries.length > 0 && (
          <div className="bg-surface-container rounded-2xl p-5 border border-outline-variant/10">
            <div className="flex items-center gap-2 mb-4">
              <span
                className="material-symbols-outlined text-xl text-green-400"
                style={{ fontVariationSettings: "'FILL' 1" }}
              >
                arrow_upward
              </span>
              <p className="font-semibold text-on-surface">
                Categorias de Receita
              </p>
            </div>
            <div className="space-y-3">
              {topIncomeEntries.map(([cat, amount]) => (
                <CategoryBar
                  key={cat}
                  label={cat}
                  amount={amount}
                  maxAmount={maxIncome}
                  barColor="bg-green-400"
                />
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Top Transactions */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {insights.topIncomes.length > 0 && (
          <div className="bg-surface-container rounded-2xl p-5 border border-outline-variant/10">
            <div className="flex items-center gap-2 mb-3">
              <span
                className="material-symbols-outlined text-xl text-green-400"
                style={{ fontVariationSettings: "'FILL' 1" }}
              >
                emoji_events
              </span>
              <p className="font-semibold text-on-surface">Maiores Receitas</p>
            </div>
            {insights.topIncomes.map(
              (tx: InsightsTransactionItem, i: number) => (
                <TransactionRow key={i} tx={tx} />
              ),
            )}
          </div>
        )}

        {insights.topExpenses.length > 0 && (
          <div className="bg-surface-container rounded-2xl p-5 border border-outline-variant/10">
            <div className="flex items-center gap-2 mb-3">
              <span
                className="material-symbols-outlined text-xl text-red-400"
                style={{ fontVariationSettings: "'FILL' 1" }}
              >
                receipt_long
              </span>
              <p className="font-semibold text-on-surface">Maiores Despesas</p>
            </div>
            {insights.topExpenses.map(
              (tx: InsightsTransactionItem, i: number) => (
                <TransactionRow key={i} tx={tx} />
              ),
            )}
          </div>
        )}
      </div>
    </div>
  );
}
