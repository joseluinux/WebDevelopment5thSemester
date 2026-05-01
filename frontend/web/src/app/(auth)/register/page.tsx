"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function RegisterPage() {
  const router = useRouter();
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isPending, setIsPending] = useState(false);

  const set = (field: string) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((prev) => ({ ...prev, [field]: e.target.value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsPending(true);
    router.push("/login");
  };

  return (
    <div className="w-full max-w-110 relative">
      {/* Ambient Glows */}
      <div className="absolute -top-24 -left-24 w-64 h-64 bg-primary/10 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute -bottom-24 -right-24 w-64 h-64 bg-tertiary/5 rounded-full blur-[100px] pointer-events-none" />

      {/* Identity */}
      <div className="text-center mb-10">
        <h1 className="font-headline text-3xl font-bold tracking-tighter text-transparent bg-clip-text bg-linear-to-br from-[#6A8CF2] to-[#B4C5FF] mb-2">
          LUMEMEI
        </h1>
        <p className="text-on-surface-variant font-medium tracking-tight text-sm uppercase">
          Crie sua conta gratuita
        </p>
      </div>

      {/* Card */}
      <div className="glass-card-auth ghost-border rounded-xl p-8 md:p-10 shadow-2xl relative z-10">
        <div className="mb-8">
          <h2 className="font-headline text-2xl font-bold text-on-surface mb-1">
            Bem-vindo ao LUMEMEI
          </h2>
          <p className="text-on-surface-variant text-sm">
            Comece gratuitamente. Sem cartão de crédito.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
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
                value={form.name}
                onChange={set("name")}
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
                value={form.email}
                onChange={set("email")}
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
                type={showPassword ? "text" : "password"}
                value={form.password}
                onChange={set("password")}
                placeholder="Mínimo 8 caracteres"
                required
                minLength={8}
                className="w-full bg-surface-container-highest/50 border-none rounded-lg py-4 pl-12 pr-10 text-on-surface placeholder:text-on-surface-variant/30 focus:ring-1 focus:ring-primary transition-all outline-none"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-on-surface-variant/40 hover:text-on-surface-variant transition-colors"
                aria-label={showPassword ? "Ocultar senha" : "Mostrar senha"}
              >
                <span className="material-symbols-outlined text-xl">
                  {showPassword ? "visibility_off" : "visibility"}
                </span>
              </button>
            </div>
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={isPending}
            className="w-full prism-gradient font-headline px-8 py-4 rounded-xl bg-linear-to-br from-[#6A8CF2] to-[#B4C5FF] text-[#002979] font-bold text-lg hover:brightness-110 transition-all glow-primary active:scale-[0.98 transition-all flex items-center justify-center gap-2 disabled:opacity-60"
          >
            <span>{isPending ? "Criando conta..." : "Criar Conta"}</span>
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
            href="#"
            className="text-[10px] uppercase tracking-widest font-bold text-on-surface-variant/30 hover:text-on-surface-variant transition-colors"
          >
            Termos
          </Link>
          <span className="w-1 h-1 bg-outline-variant/20 rounded-full" />
          <Link
            href="#"
            className="text-[10px] uppercase tracking-widest font-bold text-on-surface-variant/30 hover:text-on-surface-variant transition-colors"
          >
            Privacidade
          </Link>
          <span className="w-1 h-1 bg-outline-variant/20 rounded-full" />
          <Link
            href="#"
            className="text-[10px] uppercase tracking-widest font-bold text-on-surface-variant/30 hover:text-on-surface-variant transition-colors"
          >
            Suporte
          </Link>
        </div>
      </div>
    </div>
  );
}
