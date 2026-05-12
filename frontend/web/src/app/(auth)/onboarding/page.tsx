"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useCreateMei } from "@/hooks/useMeis";
import { useMeiContext } from "@/contexts/MeiContext";
import axios from "axios";

export default function OnboardingPage() {
  const router = useRouter();
  const createMei = useCreateMei();
  const { refetchMeis } = useMeiContext();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setIsLoading(true);
    const fd = new FormData(e.currentTarget);
    const name = (fd.get("name") as string).trim();
    const cnpj = (fd.get("cnpj") as string).trim() || undefined;
    const cnae = (fd.get("cnae") as string).trim() || undefined;
    try {
      await createMei.mutateAsync({ name, cnpj, cnae, plan: "Starter" });
      refetchMeis();
      router.push("/dashboard");
    } catch (err) {
      if (axios.isAxiosError(err) && err.response?.status === 409) {
        setError("Já existe um MEI com este CNPJ.");
      } else {
        setError("Erro ao criar MEI. Tente novamente.");
      }
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex w-full overflow-hidden">
      {/* Left Panel — Editorial Visual Anchor */}
      <div className="hidden md:flex md:w-1/2 relative items-center justify-center p-12 bg-surface-container-lowest overflow-hidden">
        {/* Gradient Blobs */}
        <div className="absolute top-[-10%] left-[-10%] w-125 h-125 bg-primary-container/10 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-100 h-100 bg-tertiary-container/5 rounded-full blur-[100px]" />

        <div className="relative z-10 max-w-lg">
          <h1 className="font-headline text-6xl font-black tracking-tighter text-white mb-6 leading-none uppercase">
            LUMEMEI
          </h1>
          <p className="text-on-surface-variant text-xl leading-relaxed mb-8 font-light">
            Precision intelligence for the modern entrepreneur. Manage your
            fiscal identity with obsidian clarity and geometric technicality.
          </p>
          <div className="grid grid-cols-2 gap-4">
            <div className="p-6 bg-surface-container rounded-xl border border-white/5">
              <span
                className="material-symbols-outlined text-primary mb-3 block"
                style={{ fontVariationSettings: "'FILL' 1" }}
              >
                analytics
              </span>
              <h3 className="font-headline font-bold text-white mb-1">
                CNAE Intelligence
              </h3>
              <p className="text-sm text-on-surface-variant">
                Automated classification and regulatory mapping.
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
                Fiscal Security
              </h3>
              <p className="text-sm text-on-surface-variant">
                Encrypted vault for high-value financial data.
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
          {/* Step Indicator */}
          <div className="space-y-4">
            <div className="flex justify-between items-end mb-2">
              <span className="font-label text-xs uppercase tracking-widest text-primary font-bold">
                Step 02 of 04
              </span>
              <span className="font-headline text-2xl font-bold text-white">
                Business DNA
              </span>
            </div>
            <div className="h-1 w-full bg-surface-container-highest rounded-full overflow-hidden">
              <div className="h-full prism-gradient w-2/4 transition-all duration-500" />
            </div>
          </div>

          {/* Form Card */}
          <div className="bg-surface-container p-8 rounded-2xl border border-white/3 shadow-2xl">
            {error && (
              <div className="mb-4 px-4 py-3 rounded-lg bg-error/10 border border-error/20 text-error text-sm">
                {error}
              </div>
            )}
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* MEI Name */}
              <div className="space-y-2">
                <label className="font-label text-[10px] uppercase tracking-[0.2em] text-on-surface-variant block">
                  Nome do MEI / Negócio *
                </label>
                <input
                  type="text"
                  name="name"
                  placeholder="Ex: João Silva Consultoria"
                  required
                  disabled={isLoading}
                  className="w-full bg-surface-container-lowest border-none rounded-lg py-4 px-4 text-sm text-on-surface focus:ring-1 focus:ring-primary/30 transition-all font-body disabled:opacity-50"
                />
              </div>

              {/* CNPJ */}
              <div className="space-y-2">
                <label className="font-label text-[10px] uppercase tracking-[0.2em] text-on-surface-variant block">
                  CNPJ{" "}
                  <span className="text-on-surface-variant/40">(opcional)</span>
                </label>
                <input
                  type="text"
                  name="cnpj"
                  placeholder="00.000.000/0001-00"
                  disabled={isLoading}
                  className="w-full bg-surface-container-lowest border-none rounded-lg py-4 px-4 text-sm text-on-surface focus:ring-1 focus:ring-primary/30 transition-all font-body disabled:opacity-50"
                />
              </div>

              {/* CNAE */}
              <div className="space-y-2">
                <label className="font-label text-[10px] uppercase tracking-[0.2em] text-on-surface-variant block">
                  CNAE{" "}
                  <span className="text-on-surface-variant/40">(opcional)</span>
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 material-symbols-outlined text-on-surface-variant text-sm">
                    search
                  </span>
                  <input
                    type="text"
                    name="cnae"
                    placeholder="ex: 6201-5/00 Desenvolvimento de software"
                    disabled={isLoading}
                    className="w-full bg-surface-container-lowest border-none rounded-lg py-4 pl-12 pr-4 text-sm text-on-surface focus:ring-1 focus:ring-primary/30 transition-all font-body disabled:opacity-50"
                  />
                </div>
              </div>

              {/* Actions */}
              <div className="pt-4 flex flex-col gap-4">
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-4 prism-gradient text-[#002979] font-headline font-bold rounded-lg hover:shadow-[0_0_20px_rgba(106,140,242,0.3)] transition-all flex items-center justify-center gap-2 disabled:opacity-60"
                >
                  {isLoading ? (
                    <span className="material-symbols-outlined animate-spin text-lg">
                      progress_activity
                    </span>
                  ) : (
                    <>
                      Entrar no Dashboard
                      <span className="material-symbols-outlined text-lg">
                        arrow_forward
                      </span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>

          {/* Legal */}
          <p className="text-center text-on-surface-variant/40 text-[10px] uppercase tracking-widest">
            By continuing, you agree to the LUMEMEI{" "}
            <span className="text-on-surface-variant/60 cursor-pointer hover:text-primary transition-colors">
              Terms of Protocol
            </span>{" "}
            and{" "}
            <span className="text-on-surface-variant/60 cursor-pointer hover:text-primary transition-colors">
              Privacy Architecture
            </span>
          </p>
        </div>
      </div>
    </div>
  );
}
