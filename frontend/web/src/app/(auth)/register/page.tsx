import Link from "next/link";

export default function RegisterPage() {
  return (
    <div className="w-full max-w-110 relative">
      {/* Ambient Glows */}
      <div className="absolute -top-24 -left-24 w-64 h-64 bg-primary/10 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute -bottom-24 -right-24 w-64 h-64 bg-tertiary/5 rounded-full blur-[100px] pointer-events-none" />

      {/* Identity */}
      <div className="text-center mb-10">
        <Link
          href="/"
          className="font-headline text-3xl font-bold tracking-tighter text-transparent bg-clip-text bg-linear-to-br from-[#6A8CF2] to-[#B4C5FF] mb-2 block hover:opacity-80 transition-opacity"
        >
          LUMEMEI
        </Link>
        <p className="text-on-surface-variant font-medium tracking-tight text-sm uppercase">
          Crie sua conta gratuita
        </p>
      </div>

      {/* Card */}
      <div className="glass-card-auth ghost-border rounded-xl p-8 md:p-10 shadow-2xl relative z-10">
        <div className="mb-8">
          <h2 className="font-headline text-2xl font-bold text-on-surface mb-1">
            Criar Cadastro
          </h2>
          <p className="text-on-surface-variant text-sm">
            Comece gratuitamente. Sem cartão de crédito.
          </p>
        </div>

        <form action="/onboarding" method="GET" className="space-y-6">
          {/* Name */}
          <div className="space-y-2">
            <label className="block text-xs font-semibold uppercase tracking-widest text-on-surface-variant/80 ml-1">
              Nome completo
            </label>
            <div className="relative group">
              <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant/40 group-focus-within:text-primary transition-colors">
                person
              </span>
              <input
                type="text"
                name="name"
                placeholder="João da Silva"
                required
                className="w-full bg-surface-container-highest/50 border-none rounded-lg py-4 pl-12 pr-4 text-on-surface placeholder:text-on-surface-variant/30 focus:ring-1 focus:ring-primary transition-all outline-none"
              />
            </div>
          </div>

          {/* Email */}
          <div className="space-y-2">
            <label className="block text-xs font-semibold uppercase tracking-widest text-on-surface-variant/80 ml-1">
              E-mail
            </label>
            <div className="relative group">
              <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant/40 group-focus-within:text-primary transition-colors">
                alternate_email
              </span>
              <input
                type="email"
                name="email"
                placeholder="nome@exemplo.com"
                required
                className="w-full bg-surface-container-highest/50 border-none rounded-lg py-4 pl-12 pr-4 text-on-surface placeholder:text-on-surface-variant/30 focus:ring-1 focus:ring-primary transition-all outline-none"
              />
            </div>
          </div>

          {/* Password */}
          <div className="space-y-2">
            <label className="block text-xs font-semibold uppercase tracking-widest text-on-surface-variant/80 ml-1">
              Senha
            </label>
            <div className="relative group">
              <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant/40 group-focus-within:text-primary transition-colors">
                lock
              </span>
              <input
                type="password"
                name="password"
                placeholder="Mínimo 8 caracteres"
                required
                minLength={8}
                className="w-full bg-surface-container-highest/50 border-none rounded-lg py-4 pl-12 pr-4 text-on-surface placeholder:text-on-surface-variant/30 focus:ring-1 focus:ring-primary transition-all outline-none"
              />
            </div>
          </div>

          {/* Submit */}
          <button
            type="submit"
            className="w-full prism-gradient text-[#002979] font-headline font-bold py-4 rounded-lg shadow-lg shadow-primary/10 hover:shadow-primary/20 active:scale-[0.98] transition-all flex items-center justify-center gap-2"
          >
            <span>Criar Conta</span>
            <span className="material-symbols-outlined text-lg">
              arrow_forward
            </span>
          </button>
        </form>
      </div>

      {/* Footer Actions */}
      <div className="mt-8 text-center space-y-4">
        <p className="text-sm text-on-surface-variant/60">
          Já tem conta?{" "}
          <Link
            href="/login"
            className="text-primary font-bold hover:underline decoration-primary/30 underline-offset-4 ml-1"
          >
            Entrar
          </Link>
        </p>
        <div className="flex items-center justify-center gap-6 pt-4">
          <Link
            href="/"
            className="text-[10px] uppercase tracking-widest font-bold text-on-surface-variant/30 hover:text-on-surface-variant transition-colors"
          >
            Termos
          </Link>
          <span className="w-1 h-1 bg-outline-variant/20 rounded-full" />
          <Link
            href="/"
            className="text-[10px] uppercase tracking-widest font-bold text-on-surface-variant/30 hover:text-on-surface-variant transition-colors"
          >
            Privacidade
          </Link>
          <span className="w-1 h-1 bg-outline-variant/20 rounded-full" />
          <Link
            href="/"
            className="text-[10px] uppercase tracking-widest font-bold text-on-surface-variant/30 hover:text-on-surface-variant transition-colors"
          >
            Suporte
          </Link>
        </div>
      </div>
    </div>
  );
}
