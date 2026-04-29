import Link from "next/link";

export function CTA() {
  return (
    <section className="py-24 px-8 relative overflow-hidden">
      <div className="max-w-4xl mx-auto relative">
        {/* Skewed background decoration */}
        <div className="absolute inset-0 bg-accent/5 -skew-y-3 -z-10 rounded-[3rem]" />

        {/* Glass card */}
        <div className="glass-card glow-primary rounded-[3rem] border border-obsidian-elevated/40 px-12 py-16 text-center relative overflow-hidden">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-100 h-50 bg-accent/8 blur-[80px] rounded-full pointer-events-none" />

          {/* Social proof */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-obsidian-elevated/60 border border-obsidian-highest/40 text-on-muted text-xs font-medium mb-8">
            <div className="flex -space-x-1">
              {["#6A8CF2","#96d0dd","#B4C5FF"].map((c) => (
                <div key={c} className="w-5 h-5 rounded-full border-2 border-obsidian-card" style={{ background: c }} />
              ))}
            </div>
            <span className="text-on-surface font-semibold">15.000 MEIs</span>
            <span>já usam o LUMEMEI</span>
          </div>

          {/* Headline */}
          <h2 className="font-display text-4xl sm:text-5xl font-bold tracking-tighter text-on-surface mb-6 leading-tight">
            Pronto para ver o{" "}
            <em className="not-italic text-transparent bg-clip-text bg-linear-to-br from-accent to-accent-light">
              seu lucro real
            </em>
            ?
          </h2>

          <p className="text-on-muted text-lg leading-relaxed mb-10 max-w-lg mx-auto">
            Comece agora gratuitamente. Sem cartão de crédito, sem complicação.
            Resultado financeiro completo em menos de 1 minuto.
          </p>

          {/* CTA button */}
          <Link
            href="/register"
            className="inline-flex items-center gap-2 px-8 py-4 rounded-2xl bg-on-surface text-obsidian-bg font-bold text-sm hover:bg-accent-light transition-all glow-primary"
          >
            Começar Gratuitamente
            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
            </svg>
          </Link>

          <p className="flex items-center justify-center gap-1.5 mt-5 text-on-muted/60 text-xs">
            <svg className="w-3.5 h-3.5 text-[#96d0dd]" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
            </svg>
            Sem necessidade de cartão de crédito
          </p>
        </div>
      </div>
    </section>
  );
}
