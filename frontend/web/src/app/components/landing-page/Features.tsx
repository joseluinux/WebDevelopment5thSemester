export function Features() {
  return (
    <section id="features" className="px-8 py-32 max-w-7xl mx-auto">
      {/* Header — sem setas */}
      <div className="mb-16 max-w-2xl">
        <h2 className="font-headline text-4xl font-bold mb-4 text-on-surface">
          Controle absoluto da sua jornada empreendedora
        </h2>
        <p className="text-on-surface-variant leading-relaxed">
          Não é apenas sobre números, é sobre liberdade. Nossa tecnologia
          elimina a adivinhação financeira.
        </p>
      </div>

      {/* Bento Grid */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
        {/* Large Card — col-span-8 — Análise em Tempo Real */}
        <div className="md:col-span-8 group relative rounded-3xl bg-surface-container-low border border-white/[0.04] p-10 overflow-hidden min-h-72 flex flex-col justify-between hover:bg-surface-container transition-colors duration-300">
          {/* Icon */}
          <div className="w-11 h-11 rounded-xl bg-surface-container-high flex items-center justify-center shrink-0">
            <span className="material-symbols-outlined text-primary text-xl">
              show_chart
            </span>
          </div>
          {/* Dashboard mockup — top-right */}
          <div className="absolute top-6 right-6 w-48 opacity-15 group-hover:opacity-25 transition-opacity pointer-events-none">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              alt=""
              className="w-full rounded-xl"
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuCkD8vTwUWh2u0YFW_2ICxY350oUM-U4Uc7u3zBgWu3MZoXN8E1bFH308gLVVoIKJ1lG0yX7pb1oGk21Goslw-pLc9pl0wmholzlujG4HN01Aj-8rCuMqR_qOZxZhpBL106-1iVQmIYOeuh4BMbuyi5jbxHcGmlRmQl2nV9MpMoDXM-AI-4GhTArK9NgGxrn_BpogdySnRST_55UEcbCde4AlWIFVYZ1bwm7JAI5RjcqFX2ksXKg2-r6p1MFX7p0jiPcLFdL8mJw3c"
            />
          </div>
          {/* Text */}
          <div>
            <h3 className="font-headline text-2xl font-bold mb-3 text-on-surface">
              Análise em Tempo Real
            </h3>
            <p className="text-on-surface-variant max-w-sm text-sm leading-relaxed">
              Conecte suas contas e veja sua margem de lucro real ser calculada
              instantaneamente a cada transação.
            </p>
          </div>
        </div>

        {/* Small Card 1 — col-span-4 — Privacidade */}
        <div className="md:col-span-4 rounded-3xl bg-surface-container-low border border-white/[0.04] p-10 flex flex-col justify-between min-h-72 hover:bg-surface-container transition-colors duration-300">
          <div className="w-11 h-11 rounded-xl bg-surface-container-high flex items-center justify-center shrink-0">
            <span className="material-symbols-outlined text-primary text-xl">
              shield_person
            </span>
          </div>
          <div>
            <h3 className="font-headline text-2xl font-bold mb-3 text-on-surface">
              Privacidade
            </h3>
            <p className="text-on-surface-variant text-sm leading-relaxed">
              Criptografia de nível bancário para garantir que seus dados
              financeiros pertençam apenas a você.
            </p>
          </div>
        </div>

        {/* Small Card 2 — col-span-4 — Agilidade */}
        <div className="md:col-span-4 rounded-3xl bg-surface-container-low border border-white/[0.04] p-10 flex flex-col justify-between min-h-64 hover:bg-surface-container transition-colors duration-300">
          <div className="w-11 h-11 rounded-xl bg-surface-container-high flex items-center justify-center shrink-0">
            <span className="material-symbols-outlined text-primary text-xl">
              bolt
            </span>
          </div>
          <div>
            <h3 className="font-headline text-2xl font-bold mb-3 text-on-surface">
              Agilidade
            </h3>
            <p className="text-on-surface-variant text-sm leading-relaxed">
              Sem formulários complexos. Responda 5 perguntas e tenha seu
              diagnóstico completo.
            </p>
          </div>
        </div>

        {/* Medium Card — col-span-8 — Relatórios MEI */}
        <div className="md:col-span-8 rounded-3xl bg-surface-container-low border border-white/[0.04] p-10 flex items-end justify-between overflow-hidden min-h-64 hover:bg-surface-container transition-colors duration-300">
          <div className="max-w-xs">
            <h3 className="font-headline text-2xl font-bold mb-3 text-on-surface">
              Relatórios MEI Automáticos
            </h3>
            <p className="text-on-surface-variant text-sm leading-relaxed">
              DASN-SIMEI simplificada. Exportamos tudo o que você precisa para
              estar em dia com a Receita.
            </p>
          </div>
          {/* Form mockup */}
          <div className="hidden sm:block shrink-0 w-52 bg-surface-container-highest rounded-2xl p-4 border border-outline-variant/10 ml-6">
            <div className="space-y-3">
              <div className="h-2 w-3/4 bg-surface-bright rounded-full" />
              <div className="h-2 w-1/2 bg-surface-bright rounded-full" />
              <div className="h-8 w-full bg-primary/10 rounded-lg border border-primary/20" />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
