import Link from "next/link";

export function CTA() {
  return (
    <section className="px-8 py-32 text-center relative overflow-hidden">
      <div className="max-w-4xl mx-auto glass-card ghost-border rounded-[3rem] p-16 md:p-24 relative z-10">
        <h2 className="font-headline text-4xl md:text-6xl font-bold mb-8">
          Pronto para ver o{" "}
          <span className="text-primary italic">seu lucro</span> real?
        </h2>
        <p className="text-on-surface-variant text-lg mb-12 max-w-lg mx-auto">
          Junte-se a mais de 15.000 MEIs que transformaram sua gestão financeira
          em 1 minuto.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            href="/register"
            className="px-12 py-5 rounded-2xl bg-[#e5e1e4] text-[#131315] font-bold text-xl hover:bg-[#dbe1ff] transition-all active:scale-95"
          >
            Experimentar Grátis
          </Link>
        </div>
        <div className="mt-8 text-on-surface-variant text-sm flex items-center justify-center gap-2">
          <span className="material-symbols-outlined text-tertiary">
            verified_user
          </span>
          Sem necessidade de cartão de crédito para testar.
        </div>
      </div>
      {/* Background Decoration */}
      <div className="absolute inset-0 bg-primary/5 -skew-y-3 -z-10 translate-y-24"></div>
    </section>
  );
}
