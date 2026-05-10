import { formatCurrency } from "@/utils/formatters";
import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Transactions — LUMEMEI" };

const TRANSACTIONS = [
  {
    id: "1",
    date: "Today, Oct 24",
    description: "Apple Store",
    category: "Hardware",
    time: "09:41 AM",
    amount: -2499,
    icon: "devices",
    imported: false,
  },
  {
    id: "2",
    date: "Today, Oct 24",
    description: "Stripe Payout",
    category: "Services",
    time: "08:15 AM",
    amount: 8750,
    icon: "south_west",
    imported: true,
  },
  {
    id: "3",
    date: "Yesterday, Oct 23",
    description: "Adobe Creative Cloud",
    category: "Software",
    time: "03:22 PM",
    amount: -299,
    icon: "brush",
    imported: false,
  },
  {
    id: "4",
    date: "Yesterday, Oct 23",
    description: "Freelance Design Project",
    category: "Services",
    time: "11:00 AM",
    amount: 3500,
    icon: "design_services",
    imported: false,
  },
  {
    id: "5",
    date: "Oct 22",
    description: "Aluguel de Coworking",
    category: "Office",
    time: "09:00 AM",
    amount: -850,
    icon: "home_work",
    imported: false,
  },
];

// Group by date
function groupByDate(txs: typeof TRANSACTIONS) {
  return txs.reduce<Record<string, typeof TRANSACTIONS>>((acc, tx) => {
    if (!acc[tx.date]) acc[tx.date] = [];
    acc[tx.date].push(tx);
    return acc;
  }, {});
}

export default function TransactionsPage() {
  const grouped = groupByDate(TRANSACTIONS);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
        <div>
          <h1 className="font-display text-4xl md:text-[3.5rem] font-bold text-on-surface leading-none tracking-tight mb-2">
            Transactions
          </h1>
          <p className="text-on-surface-variant font-body">
            Review and manage your financial ledger.
          </p>
        </div>
        <div className="flex gap-3">
          <button className="bg-surface-container-highest text-on-surface font-label text-sm py-2 px-4 rounded-lg border border-outline-variant/20 hover:bg-surface-bright transition-colors flex items-center gap-2">
            <span className="material-symbols-outlined text-lg">download</span>
            Export
          </button>
          <Link
            href="/dashboard/transactions"
            className="prism-gradient text-[#002979] font-label text-sm font-bold py-2 px-5 rounded-lg flex items-center gap-2 hover:brightness-110 transition-all"
          >
            <span className="material-symbols-outlined text-lg">add</span>
            Add Transaction
          </Link>
        </div>
      </div>

      {/* Filters Bar */}
      <div className="bg-surface-container p-4 rounded-xl flex flex-wrap gap-4 items-center justify-between">
        <div className="flex flex-wrap gap-4 flex-1">
          {/* Search */}
          <div className="bg-surface-container-lowest rounded-lg border border-outline-variant/15 flex items-center px-3 py-2 min-w-52 flex-1 md:flex-none">
            <span className="material-symbols-outlined text-on-surface-variant text-lg mr-2">
              search
            </span>
            <input
              type="text"
              placeholder="Search description..."
              className="bg-transparent border-none p-0 text-sm font-body text-on-surface focus:outline-none w-full placeholder:text-on-surface-variant/50"
            />
          </div>
          {/* Date */}
          <div className="bg-surface-container-lowest rounded-lg border border-outline-variant/15 flex items-center px-3 py-2 cursor-pointer hover:bg-surface-container transition-colors">
            <span className="material-symbols-outlined text-on-surface-variant text-lg mr-2">
              calendar_today
            </span>
            <span className="text-sm font-label text-on-surface">
              Last 30 Days
            </span>
            <span className="material-symbols-outlined text-on-surface-variant text-lg ml-2">
              expand_more
            </span>
          </div>
          {/* Type */}
          <div className="bg-surface-container-lowest rounded-lg border border-outline-variant/15 flex items-center px-3 py-2 cursor-pointer hover:bg-surface-container transition-colors">
            <span className="text-sm font-label text-on-surface">
              All Types
            </span>
            <span className="material-symbols-outlined text-on-surface-variant text-lg ml-2">
              expand_more
            </span>
          </div>
          {/* Category */}
          <div className="bg-surface-container-lowest rounded-lg border border-outline-variant/15 flex items-center px-3 py-2 cursor-pointer hover:bg-surface-container transition-colors">
            <span className="text-sm font-label text-on-surface">
              Categories
            </span>
            <span className="material-symbols-outlined text-on-surface-variant text-lg ml-2">
              expand_more
            </span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs font-label text-on-surface-variant uppercase tracking-wider">
            View
          </span>
          <button className="p-1 rounded text-primary bg-surface-container-lowest border border-outline-variant/15">
            <span className="material-symbols-outlined text-xl">list</span>
          </button>
          <button className="p-1 rounded text-on-surface-variant hover:text-on-surface">
            <span className="material-symbols-outlined text-xl">grid_view</span>
          </button>
        </div>
      </div>

      {/* Transactions grouped by date */}
      <div className="space-y-4">
        {Object.entries(grouped).map(([date, txs]) => (
          <div key={date}>
            <h3 className="font-label text-on-surface-variant text-sm uppercase tracking-widest mt-8 mb-4 px-2">
              {date}
            </h3>
            <div className="space-y-3">
              {txs.map((tx) => {
                const isIncome = tx.amount > 0;
                return (
                  <div
                    key={tx.id}
                    className="bg-surface-container rounded-xl p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 hover:bg-surface-container-high transition-colors relative overflow-hidden"
                  >
                    {tx.imported && (
                      <div className="absolute top-0 right-0 w-16 h-16 pointer-events-none overflow-hidden">
                        <div className="absolute rotate-45 bg-surface-container-highest text-[10px] font-label text-on-surface-variant py-1 -right-8.75 top-3.75 w-30 text-center border border-outline-variant/20">
                          IMPORTED
                        </div>
                      </div>
                    )}
                    <div className="flex items-center gap-4 flex-1">
                      <div
                        className={`w-12 h-12 rounded-full flex items-center justify-center ${
                          isIncome
                            ? "bg-primary-container/10 text-primary-container"
                            : "bg-surface-container-lowest text-on-surface-variant"
                        }`}
                      >
                        <span className="material-symbols-outlined">
                          {tx.icon}
                        </span>
                      </div>
                      <div>
                        <h4 className="font-display font-medium text-on-surface text-lg">
                          {tx.description}
                        </h4>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="bg-surface-container-highest px-2 py-0.5 rounded text-xs font-label text-on-surface-variant border border-outline-variant/20">
                            {tx.category}
                          </span>
                          <span className="text-xs font-body text-on-surface-variant">
                            {tx.time}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex flex-row md:flex-col items-center md:items-end justify-between w-full md:w-auto mt-4 md:mt-0">
                      <div
                        className={`font-display text-xl ${isIncome ? "text-primary-container" : "text-on-surface"}`}
                      >
                        {isIncome ? "+" : "-"}
                        {formatCurrency(Math.abs(tx.amount))}
                      </div>
                      <div className="text-xs font-label text-on-surface-variant mt-1">
                        Completed
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      <button className="w-full py-3 text-primary text-sm font-label flex items-center justify-center gap-2 hover:text-primary-container transition-colors">
        Load More Transactions
        <span className="material-symbols-outlined text-base">expand_more</span>
      </button>
    </div>
  );
}
