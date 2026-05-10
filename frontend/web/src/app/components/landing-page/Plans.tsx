import Link from "next/link";

export function Plans() {
  return (
    <section id="plans" className="px-8 py-32 bg-[#131315]">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-20">
          <h2 className="font-headline text-4xl md:text-5xl font-bold mb-6">
            Escalabilidade Sob Medida
          </h2>
          <p className="text-on-surface-variant max-w-xl mx-auto">
            Comece gratuitamente e evolua seu império com ferramentas de elite.
          </p>
        </div>

        {/* Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {/* Free Plan */}
          <div className="rounded-[2.5rem] bg-surface-container-low p-12 border border-outline-variant/10 flex flex-col justify-between hover:bg-surface-container hover:border-outline-variant/20 transition-all duration-300">
            <div>
              <div className="text-sm font-bold text-primary tracking-widest uppercase mb-4">
                Starter
              </div>
              <div className="flex items-baseline gap-1 mb-8">
                <span className="text-4xl font-headline font-bold">R$ 0</span>
                <span className="text-on-surface-variant">/mês</span>
              </div>
              <ul className="space-y-5">
                <li className="flex items-center gap-3 text-on-surface-variant">
                  <span className="material-symbols-outlined text-primary text-sm">
                    check_circle
                  </span>
                  Gestão básica de despesas
                </li>
                <li className="flex items-center gap-3 text-on-surface-variant">
                  <span className="material-symbols-outlined text-primary text-sm">
                    check_circle
                  </span>
                  Cálculo de lucro mensal
                </li>
                <li className="flex items-center gap-3 text-on-surface-variant">
                  <span className="material-symbols-outlined text-primary text-sm">
                    check_circle
                  </span>
                  Acesso mobile
                </li>
              </ul>
            </div>
            <Link
              href="/register"
              className="mt-12 w-full py-4 rounded-xl border border-outline-variant/30 text-on-surface font-semibold hover:bg-surface-variant/50 transition-all text-center block"
            >
              Começar Grátis
            </Link>
          </div>

          {/* Pro Plan */}
          <div className="relative rounded-[2.5rem] bg-surface-container p-12 border-2 border-primary/30 flex flex-col justify-between overflow-hidden glow-primary shadow-[0_0_40px_rgba(106,140,242,0.1)]">
            <div className="absolute top-0 right-0 bg-[#B4C5FF] px-6 py-2 rounded-bl-3xl text-[#002979] text-xs font-bold uppercase tracking-tighter">
              Mais Popular
            </div>
            <div className="relative z-10">
              <div className="text-sm font-bold text-primary tracking-widest uppercase mb-4">
                Pro LUMEMEI
              </div>
              <div className="flex items-baseline gap-1 mb-8">
                <span className="text-4xl font-headline font-bold">
                  R$ 49,90
                </span>
                <span className="text-on-surface-variant">/mês</span>
              </div>
              <ul className="space-y-5">
                <li className="flex items-center gap-3 text-on-surface">
                  <span
                    className="material-symbols-outlined text-primary text-sm"
                    style={{ fontVariationSettings: "'FILL' 1" }}
                  >
                    check_circle
                  </span>
                  Inteligência Preditiva de Caixa
                </li>
                <li className="flex items-center gap-3 text-on-surface">
                  <span
                    className="material-symbols-outlined text-primary text-sm"
                    style={{ fontVariationSettings: "'FILL' 1" }}
                  >
                    check_circle
                  </span>
                  Relatórios DASN Automatizados
                </li>
                <li className="flex items-center gap-3 text-on-surface">
                  <span
                    className="material-symbols-outlined text-primary text-sm"
                    style={{ fontVariationSettings: "'FILL' 1" }}
                  >
                    check_circle
                  </span>
                  Consultoria AI Financeira 24/7
                </li>
                <li className="flex items-center gap-3 text-on-surface">
                  <span
                    className="material-symbols-outlined text-primary text-sm"
                    style={{ fontVariationSettings: "'FILL' 1" }}
                  >
                    check_circle
                  </span>
                  Suporte Prioritário
                </li>
              </ul>
            </div>
            <Link
              href="/register?plan=pro"
              className="relative z-10 mt-12 w-full py-4 rounded-xl bg-linear-to-br from-[#6A8CF2] to-[#B4C5FF] text-[#002979] font-bold text-lg hover:brightness-110 transition-all text-center block"
            >
              Assinar Agora
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
