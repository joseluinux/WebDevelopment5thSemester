"use client";

import { formatCurrency } from "@/utils/formatters";
import Link from "next/link";
import { useMeiContext } from "@/contexts/MeiContext";
import { useTransactions } from "@/hooks/useTransactions";
import { useInsights } from "@/hooks/useInsights";
import { useAuth } from "@/hooks/useAuth";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function DashboardPage() {
  const { user, isLoading: authLoading } = useAuth();
  const { activeMei, meis, isMeisLoading } = useMeiContext();
  const router = useRouter();

  // Redirect to onboarding only when auth AND meis have both finished loading
  // and the user truly has no MEIs registered yet.
  useEffect(() => {
    if (!authLoading && !isMeisLoading && user && meis.length === 0) {
      router.push("/onboarding");
    }
  }, [authLoading, isMeisLoading, user, meis.length, router]);

  const meiId = activeMei?.id ?? "";

  // Aggregated stats from the dedicated insights endpoint
  const { data: insights, isLoading: insightsLoading } = useInsights(meiId);

  // Transactions used only for the "Recent Transactions" list
  const now = new Date();
  const from = `${now.getFullYear()}-01-01`;
  const to = now.toISOString().split("T")[0];

  const { data: transactions = [], isLoading: txLoading } = useTransactions({
    meiId,
    from,
    to,
  });

  const revenue = insights?.totalIncome ?? 0;
  const expenses = insights?.totalExpense ?? 0;
  const netProfit = insights?.netProfit ?? 0;
  const annualLimit = insights?.annualLimit ?? activeMei?.annualLimit ?? 81000;
  const limitPct = Math.min(100, Math.round(insights?.annualLimitUsedPct ?? 0));
  const margin = Math.round(insights?.profitMargin ?? 0);

  const statsLoading = insightsLoading;

  if (isMeisLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <span className="material-symbols-outlined animate-spin text-primary text-4xl">
          progress_activity
        </span>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex justify-between items-end">
        <div>
          <h2 className="font-display text-4xl text-on-surface tracking-tight mb-1">
            {user?.name
              ? `Olá, ${user.name.split(" ")[0]}`
              : "Financial Health"}
          </h2>
          <p className="font-body text-on-surface-variant text-sm">
            Visão geral do seu MEI —{" "}
            <span className="text-primary">{activeMei?.name ?? "—"}</span>
          </p>
        </div>
      </div>

      {/* Bento Grid */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 lg:gap-8">
        {/* MEI Limit Radar */}
        <div className="col-span-1 md:col-span-12 bg-surface-container rounded-xl p-6 md:p-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <span
                className="material-symbols-outlined text-tertiary text-sm"
                style={{ fontVariationSettings: "'FILL' 1" }}
              >
                {limitPct >= 80 ? "warning" : "shield_check"}
              </span>
              <h3 className="font-label text-on-surface uppercase tracking-widest text-xs">
                Limite Anual MEI
              </h3>
            </div>
            <p className="font-display text-3xl text-on-surface tracking-tight">
              {formatCurrency(revenue)}{" "}
              <span className="text-lg text-on-surface-variant font-body tracking-normal">
                / {formatCurrency(annualLimit)}
              </span>
            </p>
            <p
              className={`font-body text-sm mt-2 ${
                limitPct >= 80 ? "text-tertiary" : "text-primary-container"
              }`}
            >
              {limitPct}% do limite utilizado.{" "}
              {limitPct >= 80
                ? "Atenção: próximo do limite anual. Considere transição para ME."
                : "Você está dentro do limite anual."}
            </p>
          </div>
          <div className="w-full md:w-1/2 mt-4 md:mt-0">
            <div className="h-3 w-full bg-surface-container-highest rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-700 ${
                  limitPct >= 80
                    ? "bg-linear-to-r from-tertiary-fixed-dim to-tertiary"
                    : "bg-linear-to-r from-primary to-primary-container"
                }`}
                style={{ width: `${limitPct}%` }}
              />
            </div>
            <div className="flex justify-between mt-2 font-body text-xs text-on-surface-variant">
              <span>Jan 1</span>
              <span>Dez 31</span>
            </div>
          </div>
        </div>

        {/* Total Revenue */}
        <div className="col-span-1 md:col-span-3 bg-surface-container rounded-xl p-6 flex flex-col justify-between h-48 hover:-translate-y-1 transition-transform duration-300">
          <div>
            <h4 className="font-label text-on-surface-variant uppercase tracking-widest text-[10px] mb-2">
              Receita Total (Ano)
            </h4>
            {statsLoading ? (
              <span className="material-symbols-outlined animate-spin text-primary">
                progress_activity
              </span>
            ) : (
              <p className="font-display text-4xl text-on-surface tracking-tighter">
                {formatCurrency(revenue)}
              </p>
            )}
          </div>
          <div className="flex items-center gap-2 text-primary-container text-sm font-body">
            <span className="material-symbols-outlined text-sm">
              trending_up
            </span>
            <span>
              {insights?.transactionCount ??
                transactions.filter((t) => t.type === "income").length}{" "}
              transações
            </span>
          </div>
        </div>

        {/* Total Expenses */}
        <div className="col-span-1 md:col-span-3 bg-surface-container rounded-xl p-6 flex flex-col justify-between h-48 hover:-translate-y-1 transition-transform duration-300">
          <div>
            <h4 className="font-label text-on-surface-variant uppercase tracking-widest text-[10px] mb-2">
              Despesas Totais (Ano)
            </h4>
            {statsLoading ? (
              <span className="material-symbols-outlined animate-spin text-primary">
                progress_activity
              </span>
            ) : (
              <p className="font-display text-4xl text-on-surface tracking-tighter">
                {formatCurrency(expenses)}
              </p>
            )}
          </div>
          <div className="flex items-center gap-2 text-on-surface-variant text-sm font-body">
            <span className="material-symbols-outlined text-sm">
              trending_flat
            </span>
            <span>
              {transactions.filter((t) => t.type === "expense").length}{" "}
              transações
            </span>
          </div>
        </div>

        {/* Net Profit */}
        <div className="col-span-1 md:col-span-3 bg-surface-container rounded-xl p-6 flex flex-col justify-between h-48 hover:-translate-y-1 transition-transform duration-300 relative overflow-hidden">
          <div className="absolute -right-10 -top-10 w-32 h-32 bg-primary-container rounded-full blur-3xl opacity-10" />
          <div>
            <h4 className="font-label text-on-surface-variant uppercase tracking-widest text-[10px] mb-2">
              Lucro Líquido
            </h4>
            {statsLoading ? (
              <span className="material-symbols-outlined animate-spin text-primary">
                progress_activity
              </span>
            ) : (
              <p
                className={`font-display text-4xl tracking-tighter ${
                  netProfit >= 0 ? "text-primary-fixed-dim" : "text-error"
                }`}
              >
                {formatCurrency(netProfit)}
              </p>
            )}
          </div>
          <p className="font-body text-xs text-on-surface-variant mt-auto">
            Acumulado no ano
          </p>
        </div>

        {/* Operating Margin */}
        <div className="col-span-1 md:col-span-3 bg-surface-container rounded-xl p-6 flex flex-col justify-between h-48 hover:-translate-y-1 transition-transform duration-300">
          <div>
            <h4 className="font-label text-on-surface-variant uppercase tracking-widest text-[10px] mb-2">
              Margem Operacional
            </h4>
            <p className="font-display text-4xl text-on-surface tracking-tighter">
              {margin}%
            </p>
          </div>
          <div className="h-1 w-full bg-surface-container-lowest mt-4 rounded-full overflow-hidden">
            <div
              className="h-full bg-primary-container rounded-full transition-all duration-700"
              style={{ width: `${Math.max(0, margin)}%` }}
            />
          </div>
        </div>

        {/* Recent Transactions */}
        <div className="col-span-1 md:col-span-8 bg-surface-container rounded-xl p-6 flex flex-col">
          <div className="flex justify-between items-center mb-6">
            <h3 className="font-label text-on-surface uppercase tracking-widest text-xs">
              Transações Recentes
            </h3>
            <Link
              href="/dashboard/transactions"
              className="text-primary text-xs font-label uppercase tracking-widest hover:underline"
            >
              Ver todas
            </Link>
          </div>
          {txLoading ? (
            <div className="flex items-center justify-center h-32">
              <span className="material-symbols-outlined animate-spin text-primary">
                progress_activity
              </span>
            </div>
          ) : transactions.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center text-on-surface-variant text-sm gap-2 h-32">
              <span className="material-symbols-outlined text-3xl">
                receipt_long
              </span>
              <p>Nenhuma transação no ano</p>
              <Link
                href="/dashboard/transactions?new=true"
                className="text-primary text-xs underline"
              >
                Adicionar transação
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {transactions
                .slice(-5)
                .reverse()
                .map((t) => (
                  <div
                    key={t.id}
                    className="flex items-center justify-between py-2 border-b border-outline-variant/10 last:border-0"
                  >
                    <div className="flex items-center gap-3">
                      <span
                        className={`material-symbols-outlined text-sm ${
                          t.type === "income"
                            ? "text-primary-container"
                            : "text-tertiary"
                        }`}
                      >
                        {t.type === "income"
                          ? "arrow_downward"
                          : "arrow_upward"}
                      </span>
                      <div>
                        <p className="text-sm text-on-surface font-body">
                          {t.description ?? t.category ?? "—"}
                        </p>
                        <p className="text-[10px] text-on-surface-variant">
                          {t.date}
                        </p>
                      </div>
                    </div>
                    <p
                      className={`font-headline font-bold text-sm ${
                        t.type === "income"
                          ? "text-primary-container"
                          : "text-tertiary"
                      }`}
                    >
                      {t.type === "income" ? "+" : "-"}
                      {formatCurrency(t.amount)}
                    </p>
                  </div>
                ))}
            </div>
          )}
        </div>

        {/* LUMEMEI Insight */}
        <div className="col-span-1 md:col-span-4 bg-surface-bright rounded-xl p-6 relative overflow-hidden flex flex-col">
          <div className="absolute -top-12 -right-12 w-48 h-48 bg-primary-container rounded-full blur-[60px] opacity-20 pointer-events-none" />
          <div className="flex items-center gap-3 mb-6 relative z-10">
            <div className="w-10 h-10 rounded-xl bg-surface-container flex items-center justify-center border border-outline-variant/20 shadow-lg">
              <span
                className="material-symbols-outlined text-primary-container"
                style={{ fontVariationSettings: "'FILL' 1" }}
              >
                psychology
              </span>
            </div>
            <h3 className="font-label text-on-surface uppercase tracking-widest text-xs">
              LUMEMEI Insight
            </h3>
          </div>
          <div className="flex-1 relative z-10">
            <p className="font-body text-on-surface text-sm leading-relaxed mb-4">
              {limitPct >= 80
                ? `Com ${limitPct}% do limite anual utilizado, você está próximo de ultrapassar o teto de ${formatCurrency(annualLimit)}.`
                : `Você utilizou ${limitPct}% do limite anual. Continue monitorando suas receitas.`}
            </p>
            <div className="bg-surface-container-lowest p-4 rounded-lg border border-outline-variant/15">
              <p className="font-label text-primary-fixed-dim text-xs uppercase tracking-widest mb-1">
                Ação Recomendada
              </p>
              <p className="font-body text-on-surface-variant text-xs">
                {limitPct >= 80
                  ? "Considere preparar documentação para transição para ME a fim de evitar tributação extra."
                  : "Mantenha um controle regular das transações para projeções precisas."}
              </p>
            </div>
          </div>
          <Link
            href="/dashboard/insights"
            className="mt-6 w-full bg-surface-container-high hover:bg-surface-container-highest text-on-surface border border-outline-variant/20 py-3 rounded-lg font-label text-xs uppercase tracking-widest transition-colors flex justify-center items-center gap-2 relative z-10"
          >
            <span>Ver Análise Completa</span>
            <span className="material-symbols-outlined text-base">
              arrow_forward
            </span>
          </Link>
        </div>
      </div>
    </div>
  );
}
