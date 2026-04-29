"use client";

import { useState } from "react";
import Link from "next/link";
import { Eye, EyeOff, Mail, Lock, ArrowRight } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/app/components/ui/Button";

export default function LoginPage() {
  const { login, isPending, error } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await login({ email, password });
  };

  return (
    <div className="w-full max-w-md animate-fade-in">
      {/* Brand */}
      <div className="text-center mb-8">
        <p className="text-accent font-display font-bold text-xl tracking-tight">
          MEI ORACLE
        </p>
        <p className="text-on-muted text-xs tracking-[0.2em] uppercase mt-1">
          Prism Intelligence Access
        </p>
      </div>

      {/* Card */}
      <div className="bg-obsidian-card rounded-modal border border-obsidian-elevated p-8 shadow-obsidian">
        <h1 className="font-display text-2xl font-bold text-on-surface mb-1">
          Bem-vindo de volta
        </h1>
        <p className="text-on-muted text-sm mb-6">
          Acesse sua central de inteligência financeira.
        </p>

        {error && (
          <div className="mb-4 px-4 py-3 rounded-lg bg-status-error/10 border border-status-error/30 text-status-error text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Email */}
          <div>
            <label className="block text-on-muted text-xs uppercase tracking-widest mb-2 font-semibold">
              E-mail
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-on-muted" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="nome@exemplo.com"
                required
                className="w-full bg-obsidian-elevated border border-obsidian-highest rounded-lg pl-10 pr-4 py-3 text-sm text-on-surface placeholder-on-muted/60 outline-none focus:border-accent/60 transition-colors"
              />
            </div>
          </div>

          {/* Password */}
          <div>
            <div className="flex justify-between items-center mb-2">
              <label className="text-on-muted text-xs uppercase tracking-widest font-semibold">
                Senha
              </label>
              <Link
                href="/forgot-password"
                className="text-on-muted text-xs uppercase tracking-widest hover:text-accent transition-colors"
              >
                Esqueceu?
              </Link>
            </div>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-on-muted" />
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                className="w-full bg-obsidian-elevated border border-obsidian-highest rounded-lg pl-10 pr-10 py-3 text-sm text-on-surface placeholder-on-muted/60 outline-none focus:border-accent/60 transition-colors"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-on-muted hover:text-on-surface transition-colors"
                aria-label={showPassword ? "Ocultar senha" : "Mostrar senha"}
              >
                {showPassword ? (
                  <EyeOff className="w-4 h-4" />
                ) : (
                  <Eye className="w-4 h-4" />
                )}
              </button>
            </div>
          </div>

          <Button
            type="submit"
            variant="primary"
            size="lg"
            isLoading={isPending}
            icon={<ArrowRight className="w-4 h-4" />}
            iconPosition="right"
            className="w-full"
          >
            Entrar
          </Button>
        </form>

        {/* Divider */}
        <div className="flex items-center gap-3 my-5">
          <div className="flex-1 h-px bg-obsidian-elevated" />
          <span className="text-on-muted text-xs uppercase tracking-widest">
            ou continue com
          </span>
          <div className="flex-1 h-px bg-obsidian-elevated" />
        </div>

        {/* Google OAuth (placeholder) */}
        <button className="w-full flex items-center justify-center gap-3 py-3 rounded-lg border border-obsidian-elevated hover:border-obsidian-highest bg-obsidian-elevated hover:bg-obsidian-highest transition-colors text-sm text-on-surface">
          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none">
            <path
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              fill="#4285F4"
            />
            <path
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              fill="#34A853"
            />
            <path
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              fill="#FBBC05"
            />
            <path
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              fill="#EA4335"
            />
          </svg>
          Conta Google
        </button>
      </div>

      <p className="text-center text-on-muted text-sm mt-6">
        Ainda não possui conta?{" "}
        <Link
          href="/register"
          className="text-accent hover:text-accent-light transition-colors font-semibold"
        >
          Criar Cadastro
        </Link>
      </p>

      <p className="text-center text-on-muted/40 text-xs mt-4 flex items-center justify-center gap-1">
        <Lock className="w-3 h-3" />
        ENCRYPTED SESSION
      </p>
    </div>
  );
}
