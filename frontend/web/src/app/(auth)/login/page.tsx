"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState, Suspense } from "react";
import { useAuth } from "@/hooks/useAuth";
import axios from "axios";

function LoginForm() {
  const { login } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setIsLoading(true);
    const fd = new FormData(e.currentTarget);
    const email = fd.get("email") as string;
    const password = fd.get("password") as string;
    try {
      await login(email, password);
      const from = searchParams.get("from") ?? "/dashboard";
      router.push(from);
    } catch (err) {
      if (axios.isAxiosError(err) && err.response?.status === 401) {
        setError("E-mail ou senha incorretos.");
      } else {
        setError("Erro ao conectar. Tente novamente.");
      }
    } finally {
      setIsLoading(false);
    }
  }

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
          Prism Intelligence Access
        </p>
      </div>

      {/* Card */}
      <div className="glass-card-auth ghost-border rounded-xl p-8 md:p-10 shadow-2xl relative z-10">
        <div className="mb-8">
          <h2 className="font-headline text-2xl font-bold text-on-surface mb-1">
            Bem-vindo de volta
          </h2>
          <p className="text-on-surface-variant text-sm">
            Acesse sua central de inteligência financeira.
          </p>
        </div>

        {error && (
          <div className="mb-4 px-4 py-3 rounded-lg bg-error/10 border border-error/20 text-error text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
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
                disabled={isLoading}
                className="w-full bg-surface-container-highest/50 border-none rounded-lg py-4 pl-12 pr-4 text-on-surface placeholder:text-on-surface-variant/30 focus:ring-1 focus:ring-primary transition-all outline-none disabled:opacity-50"
              />
            </div>
          </div>

          {/* Password */}
          <div className="space-y-2">
            <div className="flex justify-between items-end">
              <label className="block text-xs font-semibold uppercase tracking-widest text-on-surface-variant/80 ml-1">
                Senha
              </label>
              <Link
                href="/forgot-password"
                className="text-[10px] font-bold text-primary/70 hover:text-primary transition-colors uppercase tracking-wider"
              >
                Esqueceu?
              </Link>
            </div>
            <div className="relative group">
              <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant/40 group-focus-within:text-primary transition-colors">
                lock
              </span>
              <input
                type="password"
                name="password"
                placeholder="••••••••"
                required
                disabled={isLoading}
                className="w-full bg-surface-container-highest/50 border-none rounded-lg py-4 pl-12 pr-4 text-on-surface placeholder:text-on-surface-variant/30 focus:ring-1 focus:ring-primary transition-all outline-none disabled:opacity-50"
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
                <span>Entrar</span>
                <span className="material-symbols-outlined text-lg">
                  arrow_forward
                </span>
              </>
            )}
          </button>
        </form>
      </div>

      {/* Footer Actions */}
      <div className="mt-8 text-center space-y-4">
        <p className="text-sm text-on-surface-variant/60">
          Ainda não possui conta?{" "}
          <Link
            href="/register"
            className="text-primary font-bold hover:underline decoration-primary/30 underline-offset-4 ml-1"
          >
            Criar Cadastro
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

export default function LoginPage() {
  return (
    <Suspense>
      <LoginForm />
    </Suspense>
  );
}
