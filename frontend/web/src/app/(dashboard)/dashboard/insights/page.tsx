import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = { title: "Insights — LUMEMEI" };

const RECOMMENDATIONS = [
  {
    id: "r1",
    tag: "Actionable",
    tagColor:
      "bg-surface-container text-on-surface-variant border border-outline-variant/20",
    title: "Optimize Server Costs",
    description:
      "AWS instance underutilization detected in EU-West. Scaling down could save est. $4.2k/mo.",
    borderLeft: false,
  },
  {
    id: "r2",
    tag: "High Priority",
    tagColor: "bg-error/10 text-error",
    title: "Subscription Churn Risk",
    description:
      "3 key enterprise accounts showing reduced engagement patterns matching historical churn models.",
    borderLeft: true,
  },
  {
    id: "r3",
    tag: "Strategic",
    tagColor: "bg-primary/10 text-primary",
    title: "Expand Recurring Revenue",
    description:
      "Monthly retainer clients represent only 34% of revenue. LUMEMEI recommends targeting 60%+ for stability.",
    borderLeft: false,
  },
];

export default function InsightsPage() {
  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h2 className="font-headline text-2xl font-bold text-on-surface tracking-tight">
          LUMEMEI Insights
        </h2>
        <p className="font-body text-sm text-on-surface-variant mt-1">
          AI-driven synthesis of your financial architecture.
        </p>
      </div>

      {/* Hero Stats */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Projected Revenue */}
        <div className="bg-surface-container rounded-xl p-6 border border-outline-variant/10 relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
            <span className="material-symbols-outlined text-6xl text-primary">
              trending_up
            </span>
          </div>
          <p className="font-label text-sm text-on-surface-variant uppercase tracking-wider mb-2">
            Projected Revenue
          </p>
          <h3 className="font-headline text-4xl font-bold text-on-surface tracking-tighter mb-4">
            $4.2M
          </h3>
          <div className="flex items-center gap-2 text-sm font-body">
            <span className="text-primary-container flex items-center bg-primary-container/10 px-2 py-0.5 rounded-full">
              <span className="material-symbols-outlined text-sm mr-1">
                arrow_upward
              </span>
              12.4%
            </span>
            <span className="text-on-surface-variant">vs last quarter</span>
          </div>
        </div>

        {/* Cost Anomalies */}
        <div className="bg-surface-container rounded-xl p-6 border border-outline-variant/10 relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
            <span className="material-symbols-outlined text-6xl text-error">
              warning
            </span>
          </div>
          <p className="font-label text-sm text-on-surface-variant uppercase tracking-wider mb-2">
            Cost Anomalies
          </p>
          <h3 className="font-headline text-4xl font-bold text-on-surface tracking-tighter mb-4">
            3
          </h3>
          <div className="flex items-center gap-2 text-sm font-body">
            <span className="text-error flex items-center bg-error/10 px-2 py-0.5 rounded-full">
              <span className="material-symbols-outlined text-sm mr-1">
                priority_high
              </span>
              High Severity
            </span>
            <span className="text-on-surface-variant">requires review</span>
          </div>
        </div>

        {/* System Efficiency */}
        <div className="bg-surface-container rounded-xl p-6 border border-outline-variant/10 relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
            <span className="material-symbols-outlined text-6xl text-tertiary">
              speed
            </span>
          </div>
          <p className="font-label text-sm text-on-surface-variant uppercase tracking-wider mb-2">
            System Efficiency
          </p>
          <h3 className="font-headline text-4xl font-bold text-on-surface tracking-tighter mb-4">
            94%
          </h3>
          <div className="flex items-center gap-2 text-sm font-body">
            <span className="text-tertiary flex items-center bg-tertiary/10 px-2 py-0.5 rounded-full">
              <span className="material-symbols-outlined text-sm mr-1">
                check_circle
              </span>
              Optimal
            </span>
            <span className="text-on-surface-variant">stable operation</span>
          </div>
        </div>
      </section>

      {/* Chart + Recommendations */}
      <section className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
        {/* Chart */}
        <div className="lg:col-span-2 bg-surface-container rounded-xl p-6 border border-outline-variant/10 flex flex-col">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h3 className="font-headline text-lg font-bold text-on-surface">
                Revenue vs Burn Rate
              </h3>
              <p className="font-body text-sm text-on-surface-variant">
                Trailing 6 months analysis
              </p>
            </div>
            <button className="bg-surface-container-highest hover:bg-surface-bright text-on-surface font-label text-sm px-4 py-2 rounded-lg transition-colors flex items-center gap-2 border border-outline-variant/20">
              <span className="material-symbols-outlined text-lg">
                download
              </span>
              Export
            </button>
          </div>

          {/* SVG Chart */}
          <div className="flex-1 bg-surface-container-lowest rounded-lg p-4 relative min-h-72">
            <svg
              className="w-full h-full"
              viewBox="0 0 800 300"
              preserveAspectRatio="none"
            >
              <defs>
                <linearGradient id="chart-gradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#6a8cf2" stopOpacity="0.2" />
                  <stop offset="100%" stopColor="#6a8cf2" stopOpacity="0" />
                </linearGradient>
              </defs>
              {/* Grid Lines */}
              <line
                x1="0"
                y1="50"
                x2="800"
                y2="50"
                stroke="#434652"
                strokeWidth="0.5"
                strokeDasharray="4"
                opacity="0.3"
              />
              <line
                x1="0"
                y1="150"
                x2="800"
                y2="150"
                stroke="#434652"
                strokeWidth="0.5"
                strokeDasharray="4"
                opacity="0.3"
              />
              <line
                x1="0"
                y1="250"
                x2="800"
                y2="250"
                stroke="#434652"
                strokeWidth="0.5"
                strokeDasharray="4"
                opacity="0.3"
              />
              {/* Area Fill */}
              <path
                d="M0,250 L0,180 Q100,150 200,120 T400,80 T600,100 T800,40 L800,250 Z"
                fill="url(#chart-gradient)"
              />
              {/* Revenue Line */}
              <path
                d="M0,180 Q100,150 200,120 T400,80 T600,100 T800,40"
                fill="none"
                stroke="#6a8cf2"
                strokeWidth="1.5"
              />
              {/* Burn Rate */}
              <path
                d="M0,220 Q100,210 200,190 T400,180 T600,160 T800,150"
                fill="none"
                stroke="#ffb4ab"
                strokeWidth="0.5"
                strokeDasharray="2,2"
              />
              {/* Data Points */}
              <circle
                cx="200"
                cy="120"
                r="4"
                fill="#141315"
                stroke="#6a8cf2"
                strokeWidth="2"
              />
              <circle
                cx="400"
                cy="80"
                r="4"
                fill="#141315"
                stroke="#6a8cf2"
                strokeWidth="2"
              />
              <circle
                cx="600"
                cy="100"
                r="4"
                fill="#141315"
                stroke="#6a8cf2"
                strokeWidth="2"
              />
              {/* Labels */}
              <text
                x="0"
                y="280"
                fill="#c4c6d5"
                fontFamily="Space Grotesk"
                fontSize="12"
              >
                Jan
              </text>
              <text
                x="200"
                y="280"
                textAnchor="middle"
                fill="#c4c6d5"
                fontFamily="Space Grotesk"
                fontSize="12"
              >
                Feb
              </text>
              <text
                x="400"
                y="280"
                textAnchor="middle"
                fill="#c4c6d5"
                fontFamily="Space Grotesk"
                fontSize="12"
              >
                Mar
              </text>
              <text
                x="600"
                y="280"
                textAnchor="middle"
                fill="#c4c6d5"
                fontFamily="Space Grotesk"
                fontSize="12"
              >
                Apr
              </text>
              <text
                x="780"
                y="280"
                textAnchor="end"
                fill="#c4c6d5"
                fontFamily="Space Grotesk"
                fontSize="12"
              >
                May
              </text>
            </svg>
          </div>

          <div className="mt-4 flex gap-6 px-2">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-primary-container" />
              <span className="font-body text-sm text-on-surface-variant">
                Revenue Growth
              </span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full border border-dashed border-error bg-transparent" />
              <span className="font-body text-sm text-on-surface-variant">
                Burn Rate
              </span>
            </div>
          </div>
        </div>

        {/* LUMEMEI Recommendations */}
        <div className="bg-surface-container rounded-xl p-6 border border-outline-variant/10 flex flex-col">
          <div className="flex items-center gap-3 mb-6">
            <div className="bg-primary-container/20 p-2 rounded-lg">
              <span className="material-symbols-outlined text-primary-container">
                psychology
              </span>
            </div>
            <h3 className="font-headline text-lg font-bold text-on-surface">
              LUMEMEI Recommendations
            </h3>
          </div>

          <div className="flex flex-col gap-4 flex-1">
            {RECOMMENDATIONS.map((rec) => (
              <div
                key={rec.id}
                className={`bg-surface-container-lowest p-4 rounded-lg border border-outline-variant/10 hover:bg-surface-container-highest transition-colors cursor-pointer group ${rec.borderLeft ? "border-l-2 border-l-error" : ""}`}
              >
                <div className="flex justify-between items-start mb-2">
                  <h4 className="font-label text-sm text-on-surface font-semibold group-hover:text-primary-container transition-colors">
                    {rec.title}
                  </h4>
                  <span
                    className={`px-2 py-0.5 rounded text-[10px] font-label uppercase tracking-wider ${rec.tagColor}`}
                  >
                    {rec.tag}
                  </span>
                </div>
                <p className="font-body text-xs text-on-surface-variant leading-relaxed">
                  {rec.description}
                </p>
                <div className="mt-3 flex items-center text-primary text-xs font-label uppercase tracking-wider gap-1">
                  Review Details
                  <span className="material-symbols-outlined text-sm">
                    arrow_forward
                  </span>
                </div>
              </div>
            ))}
          </div>

          <Link
            href="/dashboard/oracle-ai"
            className="mt-6 w-full py-3 rounded-lg border border-outline-variant/20 text-on-surface font-label text-xs uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-surface-container-high transition-colors"
          >
            Open LUMEMEI AI
            <span className="material-symbols-outlined text-base">
              arrow_forward
            </span>
          </Link>
        </div>
      </section>
    </div>
  );
}
