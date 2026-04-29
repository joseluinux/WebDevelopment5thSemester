import Link from "next/link";

const plans = [
  {
    name: "Starter",
    price: "Grátis",
    period: "",
    description: "Para quem está começando a controlar as finanças do MEI.",
    features: [
      "1 MEI cadastrado",
      "Até 50 transações/mês",
      "Dashboard básico",
      "Importação CSV",
      "Suporte por email",
    ],
    cta: "Começar Grátis",
    href: "/register",
    highlight: false,
  },
  {
    name: "Pro Oracle",
    price: "R$ 29",
    period: "/mês",
    description: "Para MEIs que querem inteligência financeira completa.",
    features: [
      "Até 5 MEIs cadastrados",
      "Transações ilimitadas",
      "IA Oracle integrada",
      "Relatórios automáticos",
      "Ponto de equilíbrio",
      "Insights personalizados",
      "Suporte prioritário",
    ],
    cta: "Assinar Pro Oracle",
    href: "/register?plan=pro",
    highlight: true,
  },
];

export function Plans() {
  return (
    <section id="plans" className="py-24 px-8 relative overflow-hidden">
      <div className="absolute bottom-0 right-0 w-100 h-100 bg-accent/8 blur-[100px] rounded-full -z-10 pointer-events-none" />

      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-14">
          <p className="text-accent text-xs uppercase tracking-widest font-display mb-3">Planos</p>
          <h2 className="font-display text-4xl sm:text-5xl font-bold tracking-tighter text-on-surface leading-tight">
            Simples e transparente
          </h2>
          <p className="text-on-muted mt-4 max-w-md mx-auto text-sm leading-relaxed">
            Sem cobranças surpresa. Comece grátis e evolua quando quiser.
          </p>
        </div>

        {/* Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-3xl mx-auto">
          {plans.map((plan) => (
            <div
              key={plan.name}
              className={`rounded-4xl p-8 border flex flex-col gap-6 relative overflow-hidden transition-all duration-300 ${
                plan.highlight
                  ? "bg-obsidian-card border-accent/30 glow-primary"
                  : "bg-obsidian-surface border-obsidian-elevated/50 hover:border-accent/20"
              }`}
            >
              {plan.highlight && (
                <div className="absolute top-0 right-0 w-32 h-32 bg-accent/10 blur-2xl rounded-full pointer-events-none" />
              )}

              {plan.highlight && (
                <div className="absolute top-4 right-4">
                  <span className="text-[10px] uppercase tracking-widest font-bold px-2.5 py-1 rounded-full bg-linear-to-br from-accent to-accent-light text-[#002979]">
                    Popular
                  </span>
                </div>
              )}

              <div>
                <p className="text-on-muted text-xs uppercase tracking-widest font-display mb-2">{plan.name}</p>
                <div className="flex items-end gap-1">
                  <span className="font-display text-4xl font-bold text-on-surface tracking-tighter">{plan.price}</span>
                  {plan.period && <span className="text-on-muted text-sm mb-1">{plan.period}</span>}
                </div>
                <p className="text-on-muted text-sm mt-2 leading-relaxed">{plan.description}</p>
              </div>

              <ul className="flex flex-col gap-2.5">
                {plan.features.map((f) => (
                  <li key={f} className="flex items-center gap-2.5 text-on-surface/80 text-sm">
                    <svg className="w-4 h-4 text-accent shrink-0" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                    </svg>
                    {f}
                  </li>
                ))}
              </ul>

              <Link
                href={plan.href}
                className={`mt-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-2xl font-semibold text-sm transition-all ${
                  plan.highlight
                    ? "bg-linear-to-br from-accent to-accent-light text-[#002979] hover:brightness-110 glow-primary"
                    : "border border-obsidian-elevated text-on-muted hover:text-on-surface hover:border-accent/30"
                }`}
              >
                {plan.cta}
              </Link>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
