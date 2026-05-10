import type { Metadata } from "next";

export const metadata: Metadata = { title: "LUMEMEI AI — LUMEMEI" };

const SUGGESTED_PROMPTS = [
  {
    icon: "trending_up",
    title: "Am I making a profit?",
    desc: "Analyze Q3 revenue vs operational costs.",
  },
  {
    icon: "donut_large",
    title: "Where am I spending most?",
    desc: "Breakdown expenses by vendor category.",
  },
];

export default function LumemeiAIPage() {
  return (
    <div className="flex flex-col h-[calc(100vh-3.5rem-3rem)]">
      {/* Header */}
      <div className="pb-4">
        <h1 className="font-display text-display-sm font-bold text-on-surface">
          LUMEMEI AI
        </h1>
        <p className="text-on-surface-variant text-sm mt-1">
          Your financial intelligence core.
        </p>
      </div>

      {/* Empty State — LUMEMEI Advisor */}
      <div className="flex-1 overflow-y-auto">
        <div className="flex flex-col items-center justify-center h-full text-center py-12">
          {/* LUMEMEI Icon */}
          <div className="w-16 h-16 rounded-2xl bg-primary-container/10 border border-primary-container/20 flex items-center justify-center mb-4">
            <span
              className="material-symbols-outlined text-primary-container text-3xl"
              style={{ fontVariationSettings: "'FILL' 1" }}
            >
              psychology
            </span>
          </div>
          <p className="text-on-surface font-headline font-semibold text-lg mb-2">
            LUMEMEI Advisor
          </p>
          <p className="text-on-surface-variant text-sm max-w-md mb-10 leading-relaxed">
            Your financial intelligence core. Ask me to analyze trends, generate
            reports, or identify anomalies in your ledger.
          </p>

          {/* Suggested Prompts */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full max-w-lg">
            {SUGGESTED_PROMPTS.map((prompt) => (
              <div
                key={prompt.title}
                className="text-left p-4 rounded-xl bg-surface-container border border-outline-variant/10 hover:bg-surface-container-high transition-colors cursor-pointer"
              >
                <div className="flex items-center gap-2 mb-2">
                  <span className="material-symbols-outlined text-primary text-lg">
                    {prompt.icon}
                  </span>
                  <p className="font-headline font-semibold text-on-surface text-sm">
                    {prompt.title}
                  </p>
                </div>
                <p className="text-on-surface-variant text-xs">{prompt.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Chat Input */}
      <div className="pt-4 border-t border-outline-variant/10">
        <form className="relative flex items-center gap-3">
          <button
            type="button"
            className="p-2 rounded-lg text-on-surface-variant hover:text-on-surface hover:bg-surface-container transition-colors shrink-0"
          >
            <span className="material-symbols-outlined text-xl">
              attach_file
            </span>
          </button>
          <div className="flex-1 relative">
            <input
              type="text"
              placeholder="Ask LUMEMEI to analyze data, find transactions..."
              className="w-full bg-surface-container rounded-xl px-4 py-3 text-sm text-on-surface placeholder:text-on-surface-variant/50 border border-outline-variant/10 focus:border-primary/30 focus:outline-none transition-colors"
            />
          </div>
          <button
            type="submit"
            className="p-3 rounded-xl prism-gradient text-[#002979] shrink-0 hover:brightness-110 transition-all"
          >
            <span className="material-symbols-outlined text-xl">send</span>
          </button>
        </form>
        <p className="text-center text-on-surface-variant/40 text-xs mt-3">
          LUMEMEI can make mistakes. Consider verifying critical financial
          figures.
        </p>
      </div>
    </div>
  );
}
