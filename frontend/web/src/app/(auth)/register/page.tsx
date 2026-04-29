"use client";

import { useState } from "react";
import Link from "next/link";
import { Eye, EyeOff, Mail, Lock, User, Phone, ArrowRight } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/app/components/ui/Button";

export default function RegisterPage() {
  const { register, isPending, error } = useAuth();
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
  });
  const [showPassword, setShowPassword] = useState(false);

  const set = (field: string) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((prev) => ({ ...prev, [field]: e.target.value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await register(form);
  };

  return (
    <div className="w-full max-w-md animate-fade-in">
      <div className="text-center mb-8">
        <p className="text-accent font-display font-bold text-xl tracking-tight">
          LUMEMEI
        </p>
        <p className="text-on-muted text-xs tracking-[0.2em] uppercase mt-1">
          Criar conta
        </p>
      </div>

      <div className="bg-obsidian-card rounded-modal border border-obsidian-elevated p-8 shadow-obsidian">
        <h1 className="font-display text-2xl font-bold text-on-surface mb-1">
          Crie sua conta
        </h1>
        <p className="text-on-muted text-sm mb-6">
          Comece gratuitamente. Sem cartão de crédito.
        </p>

        {error && (
          <div className="mb-4 px-4 py-3 rounded-lg bg-status-error/10 border border-status-error/30 text-status-error text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <Field
            label="Nome completo"
            icon={<User className="w-4 h-4 text-on-muted" />}
          >
            <input
              type="text"
              value={form.name}
              onChange={set("name")}
              placeholder="João da Silva"
              required
              className="input-obsidian"
            />
          </Field>

          <Field
            label="E-mail"
            icon={<Mail className="w-4 h-4 text-on-muted" />}
          >
            <input
              type="email"
              value={form.email}
              onChange={set("email")}
              placeholder="nome@exemplo.com"
              required
              className="input-obsidian"
            />
          </Field>

          <Field
            label="Telefone (opcional)"
            icon={<Phone className="w-4 h-4 text-on-muted" />}
          >
            <input
              type="tel"
              value={form.phone}
              onChange={set("phone")}
              placeholder="+55 (11) 99999-9999"
              className="input-obsidian"
            />
          </Field>

          <div>
            <label className="block text-on-muted text-xs uppercase tracking-widest mb-2 font-semibold">
              Senha
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-on-muted" />
              <input
                type={showPassword ? "text" : "password"}
                value={form.password}
                onChange={set("password")}
                placeholder="Mínimo 8 caracteres"
                required
                minLength={8}
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
            Criar Conta
          </Button>
        </form>
      </div>

      <p className="text-center text-on-muted text-sm mt-6">
        Já tem conta?{" "}
        <Link
          href="/login"
          className="text-accent hover:text-accent-light transition-colors font-semibold"
        >
          Entrar
        </Link>
      </p>
    </div>
  );
}

function Field({
  label,
  icon,
  children,
}: {
  label: string;
  icon: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="block text-on-muted text-xs uppercase tracking-widest mb-2 font-semibold">
        {label}
      </label>
      <div className="relative">
        <span className="absolute left-3 top-1/2 -translate-y-1/2">{icon}</span>
        <div className="[&_input]:w-full [&_input]:bg-obsidian-elevated [&_input]:border [&_input]:border-obsidian-highest [&_input]:rounded-lg [&_input]:pl-10 [&_input]:pr-4 [&_input]:py-3 [&_input]:text-sm [&_input]:text-on-surface [&_input]:placeholder-on-muted/60 [&_input]:outline-none [&_input:focus]:border-accent/60 [&_input]:transition-colors">
          {children}
        </div>
      </div>
    </div>
  );
}
