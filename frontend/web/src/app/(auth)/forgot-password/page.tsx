"use client";

import { useState } from "react";
import Link from "next/link";
import { Mail, ArrowRight, ArrowLeft, Shield } from "lucide-react";
import { Button } from "@/app/components/ui/Button";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [isPending, setIsPending] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsPending(true);
    // Simula envio
    setTimeout(() => {
      setSent(true);
      setIsPending(false);
    }, 800);
  };

  return (
    <div className="w-full max-w-md animate-fade-in">
      <div className="bg-obsidian-card rounded-modal border border-obsidian-elevated p-8 shadow-obsidian">
        {/* Icon */}
        <div className="w-12 h-12 rounded-xl bg-accent/15 border border-accent/20 flex items-center justify-center mx-auto mb-6">
          <Shield className="w-6 h-6 text-accent" />
        </div>

        {sent ? (
          <div className="text-center">
            <h1 className="font-display text-2xl font-bold text-on-surface mb-2">
              E-mail enviado!
            </h1>
            <p className="text-on-muted text-sm mb-6">
              Verifique sua caixa de entrada. O link expira em 30 minutos.
            </p>
            <Link href="/login">
              <Button variant="secondary" size="md" className="w-full">
                Voltar ao login
              </Button>
            </Link>
          </div>
        ) : (
          <>
            <h1 className="font-display text-2xl font-bold text-on-surface mb-1 text-center">
              Recover Access
            </h1>
            <p className="text-on-muted text-sm mb-6 text-center">
              Enter the email address associated with your LUMEMEI account to
              receive reset instructions.
            </p>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-on-muted text-xs uppercase tracking-widest mb-2 font-semibold">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-on-muted" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="director@company.com"
                    required
                    className="w-full bg-obsidian-elevated border border-obsidian-highest rounded-lg pl-10 pr-4 py-3 text-sm text-on-surface placeholder-on-muted/60 outline-none focus:border-accent/60 transition-colors"
                  />
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
                Send Reset Link
              </Button>
            </form>

            <Link
              href="/login"
              className="flex items-center justify-center gap-2 mt-5 text-on-muted hover:text-on-surface text-sm transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Return to Login
            </Link>
          </>
        )}
      </div>
    </div>
  );
}
