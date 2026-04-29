export function Features() {
  return (
    <section id="features" className="py-24 px-8 relative overflow-hidden">
      {/* Section glows */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-150 h-75 bg-accent/5 blur-[100px] rounded-full -z-10 pointer-events-none" />

      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
          <div>
            <p className="text-accent text-xs uppercase tracking-widest font-display mb-3">Funcionalidades</p>
            <h2 className="font-display text-4xl sm:text-5xl font-bold tracking-tighter text-on-surface leading-tight">
              Tudo que o seu
              <br />
              <span className="text-transparent bg-clip-text bg-linear-to-br from-accent to-accent-light">
                MEI precisa
              </span>
            </h2>
          </div>
          <p className="text-on-muted max-w-sm leading-relaxed text-sm">
            Ferramentas pensadas para simplificar a gestão financeira do
            microempreendedor brasileiro.
          </p>
        </div>

        {/* Bento Grid */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
          {/* Card 1 — Large */}
          <div className="md:col-span-8 bg-obsidian-card hover:bg-obsidian-elevated rounded-4xl p-8 border border-obsidian-elevated/50 hover:border-accent/20 transition-all duration-300 relative overflow-hidden min-h-65 flex flex-col justify-between">
            <div className="absolute top-0 right-0 w-48 h-48 bg-accent/5 blur-[60px] rounded-full pointer-events-none" />
            <div>
              <p className="text-on-muted text-xs uppercase tracking-widest font-display mb-2">Análise</p>
              <h3 className="font-display text-2xl font-bold text-on-surface mb-3">Análise em Tempo Real</h3>
              <p className="text-on-muted text-sm leading-relaxed max-w-md">
                Visualize receitas, despesas e lucro atualizados automaticamente.
                Dashboards interativos com foco no que realmente importa.
              </p>
            </div>
            {/* Mini metric preview */}
            <div className="flex gap-4 mt-6">
              {[{ label: "Receita", val: "R$ 18.200", color: "text-[#4ade80]" }, { label: "Despesa", val: "R$ 5.750", color: "text-[#f87171]" }, { label: "Lucro", val: "R$ 12.450", color: "text-accent-light" }].map((m) => (
                <div key={m.label} className="flex flex-col">
                  <span className="text-on-muted/60 text-[10px] uppercase tracking-wider">{m.label}</span>
                  <span className={`font-display font-bold text-sm ${m.color}`}>{m.val}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Card 2 — Small */}
          <div className="md:col-span-4 bg-obsidian-card hover:bg-obsidian-elevated rounded-4xl p-8 border border-obsidian-elevated/50 hover:border-accent/20 transition-all duration-300 flex flex-col gap-4">
            <div className="w-12 h-12 rounded-2xl bg-accent/10 flex items-center justify-center">
              <svg className="w-6 h-6 text-accent-light" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
              </svg>
            </div>
            <div>
              <h3 className="font-display text-xl font-bold text-on-surface mb-2">Privacidade Total</h3>
              <p className="text-on-muted text-sm leading-relaxed">
                Seus dados financeiros criptografados e isolados. Nunca compartilhados.
              </p>
            </div>
          </div>

          {/* Card 3 — Small */}
          <div className="md:col-span-4 bg-obsidian-card hover:bg-obsidian-elevated rounded-4xl p-8 border border-obsidian-elevated/50 hover:border-accent/20 transition-all duration-300 flex flex-col gap-4">
            <div className="w-12 h-12 rounded-2xl bg-[#96d0dd]/10 flex items-center justify-center">
              <svg className="w-6 h-6 text-[#96d0dd]" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z" />
              </svg>
            </div>
            <div>
              <h3 className="font-display text-xl font-bold text-on-surface mb-2">Agilidade Máxima</h3>
              <p className="text-on-muted text-sm leading-relaxed">
                Importação de CSV em segundos. Resultado financeiro em menos de 1 minuto.
              </p>
            </div>
          </div>

          {/* Card 4 — Large */}
          <div className="md:col-span-8 bg-obsidian-card hover:bg-obsidian-elevated rounded-4xl p-8 border border-obsidian-elevated/50 hover:border-accent/20 transition-all duration-300 min-h-55 flex flex-col justify-between">
            <div>
              <p className="text-on-muted text-xs uppercase tracking-widest font-display mb-2">Automação</p>
              <h3 className="font-display text-2xl font-bold text-on-surface mb-3">Relatórios MEI Automáticos</h3>
              <p className="text-on-muted text-sm leading-relaxed max-w-md">
                DAS, faturamento anual, limite MEI — tudo calculado e apresentado
                de forma clara, sem contabilidade complexa.
              </p>
            </div>
            {/* Mock well */}
            <div className="recessed-well rounded-2xl p-4 flex items-center gap-4 mt-4">
              <div className="w-8 h-8 rounded-lg bg-accent/20 flex items-center justify-center shrink-0">
                <svg className="w-4 h-4 text-accent-light" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 00.75-.75 2.25 2.25 0 00-.1-.664m-5.8 0A2.251 2.251 0 0113.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25zM6.75 12h.008v.008H6.75V12zm0 3h.008v.008H6.75V15zm0 3h.008v.008H6.75V18z" />
                </svg>
              </div>
              <div>
                <p className="text-on-surface text-sm font-semibold">Relatório de Maio/2025 gerado</p>
                <p className="text-on-muted text-xs">Faturamento: R$ 18.200,00 · DAS: R$ 71,60 · Limite: 82% utilizado</p>
              </div>
              <div className="ml-auto">
                <span className="text-xs text-[#4ade80] bg-[#4ade80]/10 px-2 py-1 rounded-full font-medium">Ok</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
