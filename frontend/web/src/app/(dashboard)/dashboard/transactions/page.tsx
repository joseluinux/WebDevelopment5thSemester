import { transactionsService } from "@/services/transactions.service";
import { formatCurrency, formatDate } from "@/utils/formatters";
import { cn } from "@/lib/cn";
import Link from "next/link";
import type { Metadata } from "next";
import type { Transaction } from "@/types";

export const metadata: Metadata = { title: "Transactions — LUMEMEI" };

async function getTransactions() {
  return transactionsService.getAll("mei_01");
}

function groupByDate(txs: Transaction[]): Record<string, Transaction[]> {
  return txs.reduce<Record<string, Transaction[]>>((acc, tx) => {
    const key = formatDate(tx.date).toUpperCase();
    if (!acc[key]) acc[key] = [];
    acc[key].push(tx);
    return acc;
  }, {});
}

export default async function TransactionsPage() {
  const { data: transactions } = await getTransactions();
  const grouped = groupByDate(transactions);

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="font-display text-display-sm font-bold text-on-surface">
            Transactions
          </h1>
          <p className="text-on-muted text-sm mt-1">
            Review and manage your financial ledger.
          </p>
        </div>
        <div className="flex gap-2">
          <button className="flex items-center gap-2 px-4 py-2 rounded-lg border border-obsidian-elevated text-on-muted hover:text-on-surface hover:border-obsidian-highest text-sm transition-colors">
            ↓ Export
          </button>
          <Link
            href="/dashboard/transactions?new=true"
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-accent text-white font-semibold text-sm hover:bg-accent-muted transition-colors"
          >
            + Add Transaction
          </Link>
        </div>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-3 flex-wrap">
        <div className="flex items-center gap-2 px-3 py-2 bg-obsidian-card rounded-lg border border-obsidian-elevated text-sm text-on-muted">
          🔍
          <input
            placeholder="Search description..."
            className="bg-transparent outline-none text-on-muted placeholder-on-muted/60 w-40"
            readOnly
          />
        </div>
        <FilterChip>Last 30 Days ▾</FilterChip>
        <FilterChip>All Types ▾</FilterChip>
        <FilterChip>Categories ▾</FilterChip>
        <div className="ml-auto flex gap-1">
          <button className="p-2 rounded-lg bg-obsidian-card border border-obsidian-elevated text-accent">
            ☰
          </button>
          <button className="p-2 rounded-lg bg-obsidian-card border border-obsidian-elevated text-on-muted hover:text-on-surface">
            ⊞
          </button>
        </div>
      </div>

      {/* Transaction List grouped by date */}
      <div className="space-y-6">
        {Object.entries(grouped).map(([date, txs]) => (
          <div key={date}>
            <p className="text-on-muted text-xs uppercase tracking-widest font-semibold mb-3">
              {date}
            </p>
            <div className="space-y-2">
              {txs.map((tx) => (
                <TransactionRow key={tx.id} tx={tx} />
              ))}
            </div>
          </div>
        ))}
      </div>

      <button className="w-full py-3 text-accent text-sm font-semibold flex items-center justify-center gap-2 hover:text-accent-light transition-colors">
        Load More Transactions ▾
      </button>
    </div>
  );
}

function TransactionRow({ tx }: { tx: Transaction }) {
  const isIncome = tx.type === "income";
  const time = new Date(tx.created_at).toLocaleTimeString("pt-BR", {
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <div className="flex items-center gap-4 bg-obsidian-card rounded-card border border-obsidian-elevated px-4 py-3 hover:border-obsidian-highest transition-colors group">
      {/* Icon */}
      <div className="w-10 h-10 rounded-xl bg-obsidian-elevated flex items-center justify-center shrink-0 text-on-muted">
        {isIncome ? "↑" : "↓"}
      </div>

      {/* Details */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <p className="text-on-surface font-semibold text-sm truncate">
            {tx.description ?? "—"}
          </p>
          {tx.import_id && (
            <span className="px-1.5 py-0.5 bg-accent/15 text-accent text-xs rounded font-semibold">
              IMPORTED
            </span>
          )}
        </div>
        <p className="text-on-muted text-xs mt-0.5">
          <span className="px-1.5 py-0.5 bg-obsidian-elevated rounded text-on-muted">
            {tx.category}
          </span>
          <span className="ml-2">{time}</span>
        </p>
      </div>

      {/* Amount */}
      <div className="text-right shrink-0">
        <p
          className={cn(
            "font-display font-bold text-sm",
            isIncome ? "text-status-success" : "text-on-surface",
          )}
        >
          {isIncome ? "+" : "-"}
          {formatCurrency(tx.amount)}
        </p>
        <p className="text-on-muted text-xs mt-0.5">Completed</p>
      </div>
    </div>
  );
}

function FilterChip({ children }: { children: React.ReactNode }) {
  return (
    <button className="px-3 py-2 bg-obsidian-card rounded-lg border border-obsidian-elevated text-on-muted text-sm hover:border-obsidian-highest hover:text-on-surface transition-colors">
      {children}
    </button>
  );
}
