export function Features() {
  return (
    <section id="features" className="px-8 py-32 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-end gap-8 mb-16">
        <div className="max-w-2xl">
          <h2 className="font-headline text-4xl font-bold mb-6">
            Controle absoluto da sua jornada empreendedora
          </h2>
          <p className="text-on-surface-variant leading-relaxed">
            Não é apenas sobre números, é sobre liberdade. Nossa tecnologia elimina a adivinhação financeira.
          </p>
        </div>
        <div className="flex gap-2">
          <button className="p-3 rounded-full border border-outline-variant/20 hover:bg-surface-container transition-colors">
            <span className="material-symbols-outlined">arrow_back</span>
          </button>
          <button className="p-3 rounded-full border border-outline-variant/20 hover:bg-surface-container transition-colors">
            <span className="material-symbols-outlined">arrow_forward</span>
          </button>
        </div>
      </div>

      {/* Bento Grid */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        {/* Large Card — col-span-8 */}
        <div className="md:col-span-8 group relative rounded-4xl bg-surface-container-low p-10 overflow-hidden transition-all hover:bg-surface-container duration-500">
          <div className="relative z-10 flex flex-col h-full justify-between">
            <div className="w-16 h-16 rounded-2xl bg-primary-container/10 flex items-center justify-center text-primary mb-8">
              <span className="material-symbols-outlined text-3xl">insights</span>
            </div>
            <div>
              <h3 className="font-headline text-2xl font-bold mb-4">Análise em Tempo Real</h3>
              <p className="text-on-surface-variant max-w-md">
                Conecte suas contas e veja sua margem de lucro real ser calculada instantaneamente a cada transação.
              </p>
            </div>
          </div>
          <div className="absolute top-0 right-0 w-1/2 h-full opacity-10 group-hover:opacity-20 transition-opacity">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              alt="Dashboard data visualization"
              className="object-cover h-full"
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuCkD8vTwUWh2u0YFW_2ICxY350oUM-U4Uc7u3zBgWu3MZoXN8E1bFH308gLVVoIKJ1lG0yX7pb1oGk21Goslw-pLc9pl0wmholzlujG4HN01Aj-8rCuMqR_qOZxZhpBL106-1iVQmIYOeuh4BMbuyi5jbxHcGmlRmQl2nV9MpMoDXM-AI-4GhTArK9NgGxrn_BpogdySnRST_55UEcbCde4AlWIFVYZ1bwm7JAI5RjcqFX2ksXKg2-r6p1MFX7p0jiPcLFdL8mJw3c"
            />
          </div>
        </div>

        {/* Small Card 1 — col-span-4 */}
        <div className="md:col-span-4 rounded-4xl bg-surface-container-low p-10 transition-all hover:bg-surface-container duration-500 border border-transparent hover:border-outline-variant/10">
          <div className="w-16 h-16 rounded-2xl bg-tertiary-container/10 flex items-center justify-center text-tertiary mb-8">
            <span className="material-symbols-outlined text-3xl">shield_person</span>
          </div>
          <h3 className="font-headline text-2xl font-bold mb-4">Privacidade</h3>
          <p className="text-on-surface-variant">
            Criptografia de nível bancário para garantir que seus dados financeiros pertençam apenas a você.
          </p>
        </div>

        {/* Small Card 2 — col-span-4 */}
        <div className="md:col-span-4 rounded-4xl bg-surface-container-low p-10 transition-all hover:bg-surface-container duration-500 border border-transparent hover:border-outline-variant/10">
          <div className="w-16 h-16 rounded-2xl bg-secondary-container/10 flex items-center justify-center text-secondary mb-8">
            <span className="material-symbols-outlined text-3xl">bolt</span>
          </div>
          <h3 className="font-headline text-2xl font-bold mb-4">Agilidade</h3>
          <p className="text-on-surface-variant">
            Sem formulários complexos. Responda 5 perguntas e tenha seu diagnóstico completo.
          </p>
        </div>

        {/* Medium Card — col-span-8 */}
        <div className="md:col-span-8 rounded-4xl bg-linear-to-br from-surface-container-low to-surface-container-highest/20 p-10 flex items-center justify-between overflow-hidden">
          <div className="max-w-xs">
            <h3 className="font-headline text-2xl font-bold mb-4">Relatórios MEI Automáticos</h3>
            <p className="text-on-surface-variant">
              DASN-SIMEI simplificada. Exportamos tudo o que você precisa para estar em dia com a Receita.
            </p>
          </div>
          <div className="hidden sm:block recessed-well w-64 h-40 rounded-2xl p-4 border border-outline-variant/5">
            <div className="space-y-3">
              <div className="h-2 w-3/4 bg-surface-variant rounded-full"></div>
              <div className="h-2 w-1/2 bg-surface-variant rounded-full"></div>
              <div className="h-8 w-full bg-primary/10 rounded-lg border border-primary/20"></div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}