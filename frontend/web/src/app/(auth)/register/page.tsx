"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import axios from "axios";

export default function RegisterPage() {
  const { register, login } = useAuth();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setIsLoading(true);
    const fd = new FormData(e.currentTarget);
    const name = fd.get("name") as string;
    const email = fd.get("email") as string;
    const password = fd.get("password") as string;
    try {
      await register(name, email, password);
      // Auto-login after successful registration
      await login(email, password);
      router.push("/onboarding");
    } catch (err) {
      if (axios.isAxiosError(err) && err.response?.status === 409) {
        setError("Este e-mail já está em uso.");
      } else {
        setError("Erro ao criar conta. Tente novamente.");
      }
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex w-full overflow-hidden">
      {/* Left Panel — Editorial Visual Anchor */}
      <div className="hidden md:flex md:w-1/2 relative items-center justify-center p-12 bg-surface-container-lowest overflow-hidden">
        <div className="absolute top-[-10%] left-[-10%] w-125 h-125 bg-primary-container/10 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-100 h-100 bg-tertiary-container/5 rounded-full blur-[100px]" />

        <div className="relative z-10 max-w-lg">
          <h1 className="font-headline text-6xl font-black tracking-tighter text-white mb-6 leading-none uppercase">
            LUMEMEI
          </h1>
          <p className="text-on-surface-variant text-xl leading-relaxed mb-8 font-light">
            Comece gratuitamente. Sem cartão de crédito. Cancele quando quiser.
          </p>
          <div className="grid grid-cols-2 gap-4">
            <div className="p-6 bg-surface-container rounded-xl border border-white/5">
              <span
                className="material-symbols-outlined text-primary mb-3 block"
                style={{ fontVariationSettings: "'FILL' 1" }}
              >
                receipt_long
              </span>
              <h3 className="font-headline font-bold text-white mb-1">
                Livro-Caixa
              </h3>
              <p className="text-sm text-on-surface-variant">
                Controle completo de entradas e saídas.
              </p>
            </div>
            <div className="p-6 bg-surface-container rounded-xl border border-white/5">
              <span
                className="material-symbols-outlined text-primary mb-3 block"
                style={{ fontVariationSettings: "'FILL' 1" }}
              >
                smart_toy
              </span>
              <h3 className="font-headline font-bold text-white mb-1">
                IA Financeira
              </h3>
              <p className="text-sm text-on-surface-variant">
                Insights automáticos para o seu negócio.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Right Panel — Form Canvas */}
      <div className="flex-1 flex flex-col items-center justify-center p-6 md:p-12 bg-surface-container-low relative">
        {/* Mobile Brand */}
        <div className="md:hidden absolute top-8 left-8">
          <span className="font-headline text-xl font-black tracking-tighter text-white">
            LUMEMEI
          </span>
        </div>

        <div className="w-full max-w-110 space-y-8">
          {/* Page Label */}
          <div className="space-y-1">
            <span className="font-label text-xs uppercase tracking-widest text-primary font-bold">
              Cadastro
            </span>
            <h2 className="font-headline text-2xl font-bold text-white">
              Criar sua conta
            </h2>
            <p className="text-on-surface-variant text-sm">
              Comece gratuitamente. Sem cartão de crédito.
            </p>
          </div>

          {/* Form Card */}
          <div className="bg-surface-container p-8 rounded-2xl border border-white/5 shadow-2xl">
            {error && (
              <div className="mb-4 px-4 py-3 rounded-lg bg-error/10 border border-error/20 text-error text-sm">
                {error}
              </div>
            )}
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Name */}
              <div className="space-y-2">
                <label className="font-label text-[10px] uppercase tracking-[0.2em] text-on-surface-variant block">
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
                    disabled={isLoading}
                    className="w-full bg-surface-container-lowest border-none rounded-lg py-4 pl-12 pr-4 text-sm text-on-surface placeholder:text-on-surface-variant/30 focus:ring-1 focus:ring-primary/30 transition-all font-body disabled:opacity-50 outline-none"
                  />
                </div>
              </div>

              {/* Email */}
              <div className="space-y-2">
                <label className="font-label text-[10px] uppercase tracking-[0.2em] text-on-surface-variant block">
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
                    disabled={isLoading}
                    className="w-full bg-surface-container-lowest border-none rounded-lg py-4 pl-12 pr-4 text-sm text-on-surface placeholder:text-on-surface-variant/30 focus:ring-1 focus:ring-primary/30 transition-all font-body disabled:opacity-50 outline-none"
                  />
                </div>
              </div>

              {/* Password */}
              <div className="space-y-2">
                <label className="font-label text-[10px] uppercase tracking-[0.2em] text-on-surface-variant block">
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
                    disabled={isLoading}
                    className="w-full bg-surface-container-lowest border-none rounded-lg py-4 pl-12 pr-4 text-sm text-on-surface placeholder:text-on-surface-variant/30 focus:ring-1 focus:ring-primary/30 transition-all font-body disabled:opacity-50 outline-none"
                  />
                </div>
              </div>

              {/* Submit */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full prism-gradient text-[#002979] font-headline font-bold py-4 rounded-lg shadow-lg shadow-primary/10 hover:shadow-primary/20 active:scale-[0.98] transition-all flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <span className="material-symbols-outlined animate-spin text-lg">
                    progress_activity
                  </span>
                ) : (
                  <>
                    <span>Criar Conta</span>
                    <span className="material-symbols-outlined text-lg">
                      arrow_forward
                    </span>
                  </>
                )}
              </button>
            </form>
          </div>

          {/* Footer */}
          <div className="text-center space-y-4">
            <p className="text-sm text-on-surface-variant/60">
              Já tem conta?{" "}
              <Link
                href="/login"
                className="text-primary font-bold hover:underline decoration-primary/30 underline-offset-4 ml-1"
              >
                Entrar
              </Link>
            </p>
            <div className="flex items-center justify-center gap-6">
              <Link
                href="/termos-de-uso"
                className="text-[10px] uppercase tracking-widest font-bold text-on-surface-variant/30 hover:text-on-surface-variant transition-colors"
              >
                Termos
              </Link>
              <span className="w-1 h-1 bg-outline-variant/20 rounded-full" />
              <Link
                href="/politica-de-privacidade"
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
      </div>
    </div>
  );
}
