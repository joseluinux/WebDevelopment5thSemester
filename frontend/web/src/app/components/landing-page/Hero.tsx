import Link from "next/link";

export function Hero() {
  return (
    <section className="relative px-8 pt-20 pb-32 max-w-7xl mx-auto flex flex-col md:flex-row items-center gap-16">
      {/* Left — Copy */}
      <div className="md:w-3/5 space-y-8 z-10">
        {/* Badge */}
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary-container/10 border border-primary-container/20 text-primary-fixed-dim text-xs font-medium tracking-wider uppercase">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-tertiary opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-tertiary"></span>
          </span>
          AI-Driven Financial Intelligence
        </div>

        {/* Headline */}
        <h1 className="font-headline text-5xl md:text-7xl font-bold leading-[1.1] text-on-surface tracking-tighter">
          Saiba se você está lucrando{" "}
          <span className="text-transparent bg-clip-text bg-linear-to-br from-[#6A8CF2] to-[#B4C5FF]">
            em 1 minuto
          </span>
        </h1>

        {/* Subtitle */}
        <p className="text-on-surface-variant text-lg md:text-xl max-w-xl leading-relaxed">
          A plataforma definitiva para MEIs que buscam clareza financeira.
          Transformamos seus dados em decisões lucrativas com inteligência
          preditiva.
        </p>

        {/* CTAs */}
        <div className="flex flex-wrap gap-6 pt-4">
          <Link
            href="/register"
            className="px-8 py-4 rounded-xl bg-linear-to-br from-[#6A8CF2] to-[#B4C5FF] text-[#002979] font-bold text-lg hover:brightness-110 transition-all glow-primary active:scale-[0.98]"
          >
            Analisar Agora
          </Link>
          <Link
            href="#features"
            className="px-8 py-4 rounded-xl border border-outline-variant/20 text-primary-fixed-dim font-medium hover:bg-surface-container-highest/40 transition-all active:scale-[0.98]"
          >
            Ver Demonstração
          </Link>
        </div>
      </div>

      {/* Right — Hero Abstract Visual */}
      <div className="md:w-2/5 relative">
        <div className="relative w-full aspect-square glass-card ghost-border rounded-4xl overflow-hidden flex items-center justify-center">
          {/* Galaxy background — more visible */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            alt="Abstract 3D digital visualization"
            className="absolute inset-0 w-full h-full object-cover opacity-65"
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuALLCGifm3oASAG-jE7-IiblTYWBKPY-ENaO-vNijYhpcHe3218VOVoT5jrBTm8ekInKv6EMb985pZYVWuE514pwqNlNGxuRoMNov66OjwI2gmQ4x4y7lDFshgRK5EEt0QtDthTtmm-XhitV3QCPCbtVnS7Tm-bn08V0ikZC8nBs4p2S2AYnKF4i1GpeK4TU3F6K7yiGTZtXFGfT77IEDC-e_YMpR8xJibf5iwmekk836GGmto0RxBK8XanT9mIvLsQHIKmbsiNq3s"
          />
          {/* Dark overlay so text stays legible */}
          <div className="absolute inset-0 bg-[#0d0c0f]/40" />

          <div className="relative z-10 w-4/5 h-4/5 flex flex-col justify-between py-8">
            {/* KPI */}
            <div className="space-y-1">
              <div className="h-0.5 w-10 bg-primary rounded-full mb-3"></div>
              <div className="text-3xl font-headline font-bold text-white tracking-tight">
                R$ 12.450,00
              </div>
              <div className="text-[10px] text-on-surface-variant/70 uppercase tracking-[0.2em] font-label">
                Faturamento Mensal
              </div>
            </div>

            {/* Bar chart — muted blue-gray palette matching screenshot */}
            <div className="h-36 w-full flex items-end gap-2">
              <div className="flex-1 rounded-t bg-[#3d4358] h-[38%]" />
              <div className="flex-1 rounded-t bg-[#4a5270] h-[56%]" />
              <div className="flex-1 rounded-t bg-[#555f7a] h-[72%]" />
              <div className="flex-1 rounded-t bg-[#7a8cba] h-[82%]" />
              <div className="flex-1 rounded-t bg-[#464d65] h-[93%]" />
            </div>
          </div>
        </div>

        {/* Floating Element */}
        <div className="absolute -bottom-6 -left-12 p-4 glass-card ghost-border rounded-2xl shadow-2xl flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-surface-container-high flex items-center justify-center">
            <span className="material-symbols-outlined text-primary text-xl">
              show_chart
            </span>
          </div>
          <div>
            <div className="text-[10px] text-on-surface-variant uppercase tracking-widest">
              Lucro Projetado
            </div>
            <div className="text-base font-bold text-on-surface">+24.5%</div>
          </div>
        </div>
      </div>

      {/* Background Glows */}
      <div className="absolute top-0 right-0 w-125 h-125 bg-primary/10 blur-[120px] rounded-full -z-10"></div>
      <div className="absolute bottom-0 left-0 w-100 h-100 bg-tertiary/5 blur-[100px] rounded-full -z-10"></div>
    </section>
  );
}
