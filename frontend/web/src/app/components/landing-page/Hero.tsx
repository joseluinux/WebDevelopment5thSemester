import Link from "next/link";

export function Hero() {
  const mockBars = [
    { h: "h-8", active: false },
    { h: "h-14", active: false },
    { h: "h-10", active: false },
    { h: "h-20", active: true },
    { h: "h-16", active: false },
    { h: "h-24", active: false },
    { h: "h-18", active: false },
    { h: "h-12", active: false },
  ];

  return (
    <section className="min-h-screen flex items-center justify-center px-8 py-32 relative overflow-hidden">
      {/* Background glows */}
      <div className="absolute top-0 right-0 w-125 h-125 bg-accent/10 blur-[120px] rounded-full -z-10 pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-100 h-100 bg-[#96d0dd]/5 blur-[100px] rounded-full -z-10 pointer-events-none" />

      <div className="max-w-7xl mx-auto w-full grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
        {/* Left — Copy */}
        <div className="flex flex-col gap-8">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-accent/10 border border-accent/20 text-accent-light text-xs font-medium tracking-widest uppercase w-fit">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#96d0dd] opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-[#96d0dd]" />
            </span>
            AI-Driven Financial Intelligence
          </div>

          {/* Headline */}
          <h1 className="font-display text-5xl sm:text-6xl font-bold leading-tight tracking-tighter text-on-surface">
            Saiba se você está
            <br />
            lucrando{" "}
            <span className="text-transparent bg-clip-text bg-linear-to-br from-accent to-accent-light">
              em 1 minuto
            </span>
          </h1>

          <p className="text-on-muted text-lg leading-relaxed max-w-lg">
            Conecte seu CEI MEI, importe suas transações e receba um diagnóstico
            financeiro completo gerado por IA — sem planilhas, sem complicação.
          </p>

          {/* CTAs */}
          <div className="flex flex-wrap gap-4">
            <Link
              href="/register"
              className="inline-flex items-center gap-2 px-7 py-3.5 rounded-2xl bg-linear-to-br from-accent to-accent-light text-[#002979] font-bold text-sm hover:brightness-110 glow-primary transition-all"
            >
              Analisar Agora
              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
              </svg>
            </Link>
            <Link
              href="#features"
              className="inline-flex items-center gap-2 px-7 py-3.5 rounded-2xl border border-obsidian-elevated text-on-surface font-semibold text-sm hover:bg-obsidian-card transition-all"
            >
              Ver Demonstração
            </Link>
          </div>

          {/* Social proof chips */}
          <div className="flex flex-wrap gap-3 pt-2">
            {["15.000+ MEIs ativos", "Sem cartão necessário", "Dados 100% seguros"].map((item) => (
              <span key={item} className="text-xs text-on-muted flex items-center gap-1.5">
                <span className="w-1 h-1 rounded-full bg-accent inline-block" />
                {item}
              </span>
            ))}
          </div>
        </div>

        {/* Right — Visual Card */}
        <div className="relative flex justify-center lg:justify-end">
          {/* Main glass card */}
          <div className="glass-card glow-primary-lg rounded-4xl p-6 w-full max-w-sm border border-obsidian-elevated/40">
            {/* Mini header */}
            <div className="flex justify-between items-center mb-6">
              <span className="text-on-muted text-xs uppercase tracking-widest font-display">Resultado Mensal</span>
              <span className="text-[#96d0dd] text-xs font-semibold bg-[#96d0dd]/10 px-2 py-0.5 rounded-full">+24.5%</span>
            </div>

            {/* Big number */}
            <div className="mb-6">
              <p className="text-on-muted text-xs mb-1">Lucro Líquido</p>
              <p className="font-display text-4xl font-bold text-on-surface tracking-tighter">R$&nbsp;12.450,00</p>
            </div>

            {/* Mock chart */}
            <div className="flex items-end gap-1.5 h-24 mb-4">
              {mockBars.map((bar, i) => (
                <div
                  key={i}
                  className={`flex-1 rounded-t-md ${bar.active ? "bg-linear-to-t from-accent to-accent-light" : "bg-obsidian-elevated"} ${bar.h} transition-all`}
                />
              ))}
            </div>

            {/* Labels */}
            <div className="flex justify-between text-on-muted/40 text-[10px]">
              {["Jan","Fev","Mar","Abr","Mai","Jun","Jul","Ago"].map((m) => (
                <span key={m}>{m}</span>
              ))}
            </div>
          </div>

          {/* Floating badge */}
          <div className="absolute -bottom-4 -left-6 glass-card rounded-2xl px-4 py-2.5 border border-obsidian-elevated/40 flex items-center gap-2 shadow-xl">
            <span className="w-2 h-2 rounded-full bg-[#4ade80] animate-pulse" />
            <span className="text-on-surface text-sm font-semibold">+24.5% Lucro Projetado</span>
          </div>
        </div>
      </div>
    </section>
  );
}
