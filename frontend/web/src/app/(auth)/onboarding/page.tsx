"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, BarChart3, Shield, ChevronLeft } from "lucide-react";
import { Button } from "@/app/components/ui/Button";
import { useMeiContext } from "@/context";
import { meiService } from "@/services/mei.service";

const STEPS = [
  "Identidade",
  "Business DNA",
  "Configuração",
  "Pronto!",
] as const;
const CNAE_OPTIONS = [
  "6201-5/00 Desenvolvimento de software",
  "4712-1/00 Comércio",
  "6204-0/00 Consultoria",
  "8599-6/04 Treinamento",
];
const REVENUE_OPTIONS = [
  { label: "Até R$ 40k", value: "0-40000", desc: "Micro Scale" },
  { label: "R$ 40k – R$ 81k", value: "40000-81000", desc: "Standard MEI" },
];

export default function OnboardingPage() {
  const router = useRouter();
  const { refetch } = useMeiContext();
  const [step, setStep] = useState(0);
  const [form, setForm] = useState({
    meiName: "",
    cnpj: "",
    cnae: "",
    revenue: "",
    employees: 1,
  });
  const [isLoading, setIsLoading] = useState(false);

  const next = () => setStep((s) => Math.min(s + 1, STEPS.length - 1));
  const back = () => setStep((s) => Math.max(s - 1, 0));

  const handleFinish = async () => {
    setIsLoading(true);
    try {
      await meiService.create({
        name: form.meiName || "Meu MEI",
        cnpj: form.cnpj,
        cnae: form.cnae,
        annual_limit: 81000,
        plan: "starter",
      });
      await refetch();
      router.push("/dashboard");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-obsidian-bg flex">
      {/* Left panel */}
      <div className="hidden lg:flex w-1/2 bg-obsidian-surface flex-col justify-center px-16">
        <p className="font-display font-bold text-4xl text-on-surface mb-4 tracking-tight">
          MEI ORACLE
        </p>
        <p className="text-on-muted text-lg leading-relaxed mb-10">
          Precision intelligence for the modern entrepreneur. Manage your fiscal
          identity with obsidian clarity and geometric technicality.
        </p>
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-obsidian-card rounded-card p-5 border border-obsidian-elevated">
            <BarChart3 className="w-5 h-5 text-accent mb-3" />
            <p className="text-on-surface font-semibold text-sm">
              CNAE Intelligence
            </p>
            <p className="text-on-muted text-xs mt-1">
              Automated classification and regulatory mapping.
            </p>
          </div>
          <div className="bg-obsidian-card rounded-card p-5 border border-obsidian-elevated">
            <Shield className="w-5 h-5 text-accent mb-3" />
            <p className="text-on-surface font-semibold text-sm">
              Fiscal Security
            </p>
            <p className="text-on-muted text-xs mt-1">
              Encrypted vault for high-value financial data.
            </p>
          </div>
        </div>
      </div>

      {/* Right panel */}
      <div className="flex-1 flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-sm">
          {/* Progress */}
          <div className="mb-8">
            <div className="flex justify-between items-center mb-3">
              <p className="text-on-muted text-xs uppercase tracking-widest">
                Step {String(step + 1).padStart(2, "0")} of{" "}
                {String(STEPS.length).padStart(2, "0")}
              </p>
              <p className="text-on-surface font-display font-bold">
                {STEPS[step]}
              </p>
            </div>
            <div className="w-full h-1 bg-obsidian-elevated rounded-full overflow-hidden">
              <div
                className="h-full bg-accent-gradient rounded-full transition-all duration-500"
                style={{ width: `${((step + 1) / STEPS.length) * 100}%` }}
              />
            </div>
          </div>

          {/* Step 0 — Identidade */}
          {step === 0 && (
            <div className="bg-obsidian-card rounded-modal border border-obsidian-elevated p-6 space-y-4 animate-fade-in">
              <h2 className="font-display text-xl font-bold text-on-surface">
                Identificação do MEI
              </h2>
              <div>
                <label className="block text-on-muted text-xs uppercase tracking-widest mb-2 font-semibold">
                  Nome do negócio
                </label>
                <input
                  type="text"
                  value={form.meiName}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, meiName: e.target.value }))
                  }
                  placeholder="Ex: TechNova Solutions"
                  className="w-full bg-obsidian-elevated border border-obsidian-highest rounded-lg px-4 py-3 text-sm text-on-surface placeholder-on-muted/60 outline-none focus:border-accent/60 transition-colors"
                />
              </div>
              <div>
                <label className="block text-on-muted text-xs uppercase tracking-widest mb-2 font-semibold">
                  CNPJ (opcional)
                </label>
                <input
                  type="text"
                  value={form.cnpj}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, cnpj: e.target.value }))
                  }
                  placeholder="00.000.000/0001-00"
                  className="w-full bg-obsidian-elevated border border-obsidian-highest rounded-lg px-4 py-3 text-sm text-on-surface placeholder-on-muted/60 outline-none focus:border-accent/60 transition-colors"
                />
              </div>
              <Button
                onClick={next}
                variant="primary"
                size="lg"
                className="w-full"
                icon={<ArrowRight className="w-4 h-4" />}
                iconPosition="right"
              >
                Continue
              </Button>
            </div>
          )}

          {/* Step 1 — Business DNA */}
          {step === 1 && (
            <div className="bg-obsidian-card rounded-modal border border-obsidian-elevated p-6 space-y-4 animate-fade-in">
              <h2 className="font-display text-xl font-bold text-on-surface">
                Business DNA
              </h2>

              <div>
                <label className="block text-on-muted text-xs uppercase tracking-widest mb-2 font-semibold">
                  Primary CNAE Activity
                </label>
                <div className="relative">
                  <select
                    value={form.cnae}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, cnae: e.target.value }))
                    }
                    className="w-full bg-obsidian-elevated border border-obsidian-highest rounded-lg px-4 py-3 text-sm text-on-surface outline-none focus:border-accent/60 transition-colors appearance-none"
                  >
                    <option value="">
                      e.g. 6201-5/00 Development of software
                    </option>
                    {CNAE_OPTIONS.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-on-muted text-xs uppercase tracking-widest mb-2 font-semibold">
                  Annual Projected Revenue
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {REVENUE_OPTIONS.map((opt) => (
                    <button
                      key={opt.value}
                      onClick={() =>
                        setForm((f) => ({ ...f, revenue: opt.value }))
                      }
                      className={`p-3 rounded-lg border text-left transition-colors ${
                        form.revenue === opt.value
                          ? "border-accent bg-accent/15 text-on-surface"
                          : "border-obsidian-elevated bg-obsidian-elevated text-on-muted hover:border-obsidian-highest"
                      }`}
                    >
                      <p className="font-semibold text-sm">{opt.label}</p>
                      <p className="text-xs mt-0.5">{opt.desc}</p>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-on-muted text-xs uppercase tracking-widest mb-2 font-semibold">
                  Employee Count: {form.employees}
                </label>
                <input
                  type="range"
                  min={1}
                  max={10}
                  value={form.employees}
                  onChange={(e) =>
                    setForm((f) => ({
                      ...f,
                      employees: Number(e.target.value),
                    }))
                  }
                  className="w-full accent-accent"
                />
              </div>

              <div className="flex gap-2">
                <Button
                  onClick={back}
                  variant="secondary"
                  size="md"
                  icon={<ChevronLeft className="w-4 h-4" />}
                  className="flex-1"
                >
                  Voltar
                </Button>
                <Button
                  onClick={next}
                  variant="primary"
                  size="md"
                  icon={<ArrowRight className="w-4 h-4" />}
                  iconPosition="right"
                  className="flex-1"
                >
                  Continue Analysis
                </Button>
              </div>

              <button
                onClick={next}
                className="w-full text-center text-on-muted text-xs hover:text-on-surface transition-colors py-1"
              >
                SKIP FOR NOW
              </button>
            </div>
          )}

          {/* Step 2 — Configuração */}
          {step === 2 && (
            <div className="bg-obsidian-card rounded-modal border border-obsidian-elevated p-6 space-y-4 animate-fade-in">
              <h2 className="font-display text-xl font-bold text-on-surface">
                Quase lá!
              </h2>
              <p className="text-on-muted text-sm">
                Seu perfil está configurado. Revise as informações antes de
                finalizar.
              </p>
              <div className="bg-obsidian-elevated rounded-lg p-4 space-y-2 text-sm">
                <Row label="Negócio" value={form.meiName || "—"} />
                <Row label="CNPJ" value={form.cnpj || "—"} />
                <Row label="CNAE" value={form.cnae || "—"} />
                <Row label="Receita" value={form.revenue || "—"} />
                <Row label="Funcionários" value={String(form.employees)} />
              </div>
              <div className="flex gap-2">
                <Button
                  onClick={back}
                  variant="secondary"
                  size="md"
                  icon={<ChevronLeft className="w-4 h-4" />}
                  className="flex-1"
                >
                  Voltar
                </Button>
                <Button
                  onClick={next}
                  variant="primary"
                  size="md"
                  icon={<ArrowRight className="w-4 h-4" />}
                  iconPosition="right"
                  className="flex-1"
                >
                  Confirmar
                </Button>
              </div>
            </div>
          )}

          {/* Step 3 — Done */}
          {step === 3 && (
            <div className="bg-obsidian-card rounded-modal border border-obsidian-elevated p-6 text-center space-y-4 animate-fade-in">
              <div className="w-16 h-16 rounded-full bg-status-success/15 border border-status-success/30 flex items-center justify-center mx-auto">
                <span className="text-3xl">🎯</span>
              </div>
              <h2 className="font-display text-xl font-bold text-on-surface">
                Pronto para decolar!
              </h2>
              <p className="text-on-muted text-sm">
                Seu MEI foi configurado. Acesse o dashboard e comece a controlar
                suas finanças.
              </p>
              <Button
                onClick={handleFinish}
                variant="primary"
                size="lg"
                isLoading={isLoading}
                className="w-full"
                icon={<ArrowRight className="w-4 h-4" />}
                iconPosition="right"
              >
                Acessar Dashboard
              </Button>
            </div>
          )}

          <p className="text-center text-on-muted/40 text-xs mt-6">
            BY CONTINUING, YOU AGREE TO THE LUMEMEI{" "}
            <span className="underline cursor-pointer">TERMS OF PROTOCOL</span>{" "}
            AND{" "}
            <span className="underline cursor-pointer">
              PRIVACY ARCHITECTURE
            </span>
          </p>
          <p className="text-center text-on-muted/30 text-xs mt-2 flex items-center justify-center gap-1">
            <Shield className="w-3 h-3" /> L2 ENCRYPTED SESSION
          </p>
        </div>
      </div>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between">
      <span className="text-on-muted">{label}</span>
      <span className="text-on-surface font-medium">{value}</span>
    </div>
  );
}
