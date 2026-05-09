import { formatCurrency, formatPercent } from "@/utils/formatters";
import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Dashboard — LUMEMEI",
};

const CHART_DATA = [
  { month: "Jan", revPct: 45, expPct: 30 },
  { month: "Feb", revPct: 50, expPct: 35 },
  { month: "Mar", revPct: 60, expPct: 25 },
  { month: "Apr", revPct: 55, expPct: 40 },
  { month: "May", revPct: 80, expPct: 45 },
  { month: "Jun", revPct: 90, expPct: 38 },
];

export default function DashboardPage() {
  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex justify-between items-end">
        <div>
          <h2 className="font-display text-4xl text-on-surface tracking-tight mb-1">
            Financial Health
          </h2>
          <p className="font-body text-on-surface-variant text-sm">
            Real-time overview of your MEI performance.
          </p>
        </div>
      </div>

      {/* Bento Grid */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 lg:gap-8">
        {/* MEI Limit Radar (full span) */}
        <div className="col-span-1 md:col-span-12 bg-surface-container rounded-xl p-6 md:p-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <span
                className="material-symbols-outlined text-tertiary text-sm"
                style={{ fontVariationSettings: "'FILL' 1" }}
              >
                warning
              </span>
              <h3 className="font-label text-on-surface uppercase tracking-widest text-xs">
                MEI Annual Limit Radar
              </h3>
            </div>
            <p className="font-display text-3xl text-on-surface tracking-tight">
              {formatCurrency(68500)}{" "}
              <span className="text-lg text-on-surface-variant font-body tracking-normal">
                / {formatCurrency(81000)}
              </span>
            </p>
            <p className="font-body text-tertiary text-sm mt-2">
              Approaching annual limit. 84% utilized. Consider transition
              scenarios to ME.
            </p>
          </div>
          <div className="w-full md:w-1/2 mt-4 md:mt-0">
            <div className="h-3 w-full bg-surface-container-highest rounded-full overflow-hidden">
              <div
                className="h-full bg-linear-to-r from-tertiary-fixed-dim to-tertiary rounded-full"
                style={{ width: "84%" }}
              />
            </div>
            <div className="flex justify-between mt-2 font-body text-xs text-on-surface-variant">
              <span>Jan 1</span>
              <span>Dec 31</span>
            </div>
          </div>
        </div>

        {/* Total Revenue */}
        <div className="col-span-1 md:col-span-3 bg-surface-container rounded-xl p-6 flex flex-col justify-between h-48 hover:-translate-y-1 transition-transform duration-300">
          <div>
            <h4 className="font-label text-on-surface-variant uppercase tracking-widest text-[10px] mb-2">
              Total Revenue
            </h4>
            <p className="font-display text-4xl text-on-surface tracking-tighter">
              R$ 68.5k
            </p>
          </div>
          <div className="flex items-center gap-2 text-primary-container text-sm font-body">
            <span className="material-symbols-outlined text-sm">
              trending_up
            </span>
            <span>+12.4% vs last mo</span>
          </div>
        </div>

        {/* Total Expenses */}
        <div className="col-span-1 md:col-span-3 bg-surface-container rounded-xl p-6 flex flex-col justify-between h-48 hover:-translate-y-1 transition-transform duration-300">
          <div>
            <h4 className="font-label text-on-surface-variant uppercase tracking-widest text-[10px] mb-2">
              Total Expenses
            </h4>
            <p className="font-display text-4xl text-on-surface tracking-tighter">
              R$ 32.1k
            </p>
          </div>
          <div className="flex items-center gap-2 text-on-surface-variant text-sm font-body">
            <span className="material-symbols-outlined text-sm">
              trending_flat
            </span>
            <span>+2.1% vs last mo</span>
          </div>
        </div>

        {/* Net Profit */}
        <div className="col-span-1 md:col-span-3 bg-surface-container rounded-xl p-6 flex flex-col justify-between h-48 hover:-translate-y-1 transition-transform duration-300 relative overflow-hidden">
          <div className="absolute -right-10 -top-10 w-32 h-32 bg-primary-container rounded-full blur-3xl opacity-10" />
          <div>
            <h4 className="font-label text-on-surface-variant uppercase tracking-widest text-[10px] mb-2">
              Net Profit
            </h4>
            <p className="font-display text-4xl text-primary-fixed-dim tracking-tighter">
              R$ 36.4k
            </p>
          </div>
          <p className="font-body text-xs text-on-surface-variant mt-auto">
            YTD Cumulative
          </p>
        </div>

        {/* Operating Margin */}
        <div className="col-span-1 md:col-span-3 bg-surface-container rounded-xl p-6 flex flex-col justify-between h-48 hover:-translate-y-1 transition-transform duration-300">
          <div>
            <h4 className="font-label text-on-surface-variant uppercase tracking-widest text-[10px] mb-2">
              Operating Margin
            </h4>
            <p className="font-display text-4xl text-on-surface tracking-tighter">
              53.1%
            </p>
          </div>
          <div className="h-1 w-full bg-surface-container-lowest mt-4 rounded-full overflow-hidden">
            <div className="h-full bg-primary-container w-[53%] rounded-full" />
          </div>
        </div>

        {/* Revenue Chart (col-8) */}
        <div className="col-span-1 md:col-span-8 bg-surface-container rounded-xl p-6 flex flex-col">
          <div className="flex justify-between items-center mb-8">
            <h3 className="font-label text-on-surface uppercase tracking-widest text-xs">
              Revenue vs Expenses (6M)
            </h3>
            <button className="text-on-surface-variant hover:text-white transition-colors">
              <span className="material-symbols-outlined text-sm">
                more_horiz
              </span>
            </button>
          </div>
          {/* Bar Chart */}
          <div className="flex-1 flex items-end gap-2 sm:gap-4 md:gap-8 h-48 px-2 relative z-10">
            {/* Y-axis lines */}
            <div className="absolute left-0 bottom-0 w-full h-full flex flex-col justify-between z-0 pointer-events-none opacity-20">
              <div className="w-full border-b border-outline-variant h-px" />
              <div className="w-full border-b border-outline-variant h-px" />
              <div className="w-full border-b border-outline-variant h-px" />
            </div>
            {CHART_DATA.map((d) => (
              <div
                key={d.month}
                className="flex-1 flex flex-col justify-end items-center gap-2 group z-10"
              >
                <div className="w-full max-w-10 flex gap-1 items-end justify-center h-full">
                  <div
                    className="w-1/2 bg-surface-container-highest rounded-t-sm transition-all group-hover:opacity-80"
                    style={{ height: `${d.expPct}%` }}
                  />
                  <div
                    className="w-1/2 bg-primary-container rounded-t-sm transition-all group-hover:bg-primary"
                    style={{ height: `${d.revPct}%` }}
                  />
                </div>
                <span className="font-label text-[10px] text-on-surface-variant uppercase">
                  {d.month}
                </span>
              </div>
            ))}
          </div>
          <div className="mt-4 flex items-center justify-center gap-6 font-body text-xs text-on-surface-variant">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-primary-container" />
              Revenue
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-surface-container-highest" />
              Expenses
            </div>
          </div>
        </div>

        {/* LUMEMEI Insight (col-4) */}
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
              Based on your current trajectory, you are highly likely to exceed
              the R$ 81k MEI threshold by late October.
            </p>
            <div className="bg-surface-container-lowest p-4 rounded-lg border border-outline-variant/15">
              <p className="font-label text-primary-fixed-dim text-xs uppercase tracking-widest mb-1">
                Recommended Action
              </p>
              <p className="font-body text-on-surface-variant text-xs">
                Schedule a consultation to prepare documentation for ME
                transition to avoid penalty taxes.
              </p>
            </div>
          </div>
          <Link
            href="/dashboard/oracle-ai"
            className="mt-6 w-full bg-surface-container-high hover:bg-surface-container-highest text-on-surface border border-outline-variant/20 py-3 rounded-lg font-label text-xs uppercase tracking-widest transition-colors flex justify-center items-center gap-2 relative z-10"
          >
            <span>View Full Analysis</span>
            <span className="material-symbols-outlined text-base">
              arrow_forward
            </span>
          </Link>
        </div>
      </div>
    </div>
  );
}
