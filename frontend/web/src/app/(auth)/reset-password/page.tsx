"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState, Suspense } from "react";
import apiClient from "@/lib/apiClient";
import axios from "axios";

function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    const fd = new FormData(e.currentTarget);
    const password = fd.get("password") as string;
    const confirm = fd.get("confirm") as string;

    if (password !== confirm) {
      setError("As senhas não coincidem.");
      return;
    }

    setIsLoading(true);
    try {
      await apiClient.post("/v1/auth/reset-password", { token, password });
      setSuccess(true);
      setTimeout(() => router.push("/login"), 3000);
    } catch (err) {
      if (axios.isAxiosError(err) && err.response?.status === 400) {
        setError("Link inválido ou expirado. Solicite um novo.");
      } else {
        setError("Erro ao redefinir a senha. Tente novamente.");
      }
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex w-full overflow-hidden">
      {/* Left Panel */}
      <div className="hidden md:flex md:w-1/2 relative items-center justify-center p-12 bg-surface-container-lowest overflow-hidden">
        <div className="absolute top-[-10%] left-[-10%] w-125 h-125 bg-primary-container/10 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-100 h-100 bg-tertiary-container/5 rounded-full blur-[100px]" />

        <div className="relative z-10 max-w-lg">
          <h1 className="font-headline text-6xl font-black tracking-tighter text-white mb-6 leading-none uppercase">
            LUMEMEI
          </h1>
          <p className="text-on-surface-variant text-xl leading-relaxed mb-8 font-light">
            Sua segurança é prioridade. Defina uma nova senha forte para
            proteger sua conta.
          </p>
          <div className="grid grid-cols-2 gap-4">
            <div className="p-6 bg-surface-container rounded-xl border border-white/5">
              <span
                className="material-symbols-outlined text-primary mb-3 block"
                style={{ fontVariationSettings: "'FILL' 1" }}
              >
                lock_reset
              </span>
              <h3 className="font-headline font-bold text-white mb-1">
                Senha Segura
              </h3>
              <p className="text-sm text-on-surface-variant">
                Use ao menos 8 caracteres com letras e números.
              </p>
            </div>
            <div className="p-6 bg-surface-container rounded-xl border border-white/5">
              <span
                className="material-symbols-outlined text-primary mb-3 block"
                style={{ fontVariationSettings: "'FILL' 1" }}
              >
                shield_with_heart
              </span>
              <h3 className="font-headline font-bold text-white mb-1">
                Dados Protegidos
              </h3>
              <p className="text-sm text-on-surface-variant">
                Seus dados financeiros permanecem seguros.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Right Panel */}
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
              Segurança
            </span>
            <h2 className="font-headline text-2xl font-bold text-white">
              Redefinir Senha
            </h2>
            <p className="text-on-surface-variant text-sm">
              Crie uma nova senha para acessar sua conta.
            </p>
          </div>

          {/* Form Card */}
          <div className="bg-surface-container p-8 rounded-2xl border border-white/5 shadow-2xl">
            {!token ? (
              <div className="px-4 py-6 rounded-lg bg-error/10 border border-error/20 text-center">
                <span
                  className="material-symbols-outlined text-error text-4xl mb-2 block"
                  style={{ fontVariationSettings: "'FILL' 1" }}
                >
                  link_off
                </span>
                <p className="text-on-surface font-semibold mb-1">
                  Link inválido
                </p>
                <p className="text-on-surface-variant text-sm">
                  Este link é inválido ou expirou.{" "}
                  <Link
                    href="/forgot-password"
                    className="text-primary hover:underline"
                  >
                    Solicite um novo.
                  </Link>
                </p>
              </div>
            ) : success ? (
              <div className="px-4 py-6 rounded-lg bg-primary/10 border border-primary/20 text-center">
                <span
                  className="material-symbols-outlined text-primary text-4xl mb-2 block"
                  style={{ fontVariationSettings: "'FILL' 1" }}
                >
                  check_circle
                </span>
                <p className="text-on-surface font-semibold mb-1">
                  Senha redefinida!
                </p>
                <p className="text-on-surface-variant text-sm">
                  Redirecionando para o login em instantes…
                </p>
              </div>
            ) : (
              <>
                {error && (
                  <div className="mb-4 px-4 py-3 rounded-lg bg-error/10 border border-error/20 text-error text-sm">
                    {error}
                  </div>
                )}
                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Nova Senha */}
                  <div className="space-y-2">
                    <label className="font-label text-[10px] uppercase tracking-[0.2em] text-on-surface-variant block">
                      Nova Senha
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

                  {/* Confirmar Senha */}
                  <div className="space-y-2">
                    <label className="font-label text-[10px] uppercase tracking-[0.2em] text-on-surface-variant block">
                      Confirmar Senha
                    </label>
                    <div className="relative group">
                      <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant/40 group-focus-within:text-primary transition-colors">
                        lock_open
                      </span>
                      <input
                        type="password"
                        name="confirm"
                        placeholder="Repita a nova senha"
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
                        <span>Salvar Nova Senha</span>
                        <span className="material-symbols-outlined text-lg">
                          arrow_forward
                        </span>
                      </>
                    )}
                  </button>
                </form>
              </>
            )}
          </div>

          {/* Footer */}
          <div className="text-center">
            <Link
              href="/login"
              className="text-sm text-on-surface-variant/60 hover:text-on-surface-variant transition-colors flex items-center justify-center gap-1"
            >
              <span className="material-symbols-outlined text-base">
                arrow_back
              </span>
              Voltar para o login
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense>
      <ResetPasswordForm />
    </Suspense>
  );
}
