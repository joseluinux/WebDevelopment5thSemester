"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useMeiContext } from "@/contexts/MeiContext";
import { usePreviewImport, useConfirmImport } from "@/hooks/useImports";
import type { ImportPreview } from "@/types";

type Step = "upload" | "previewing" | "preview" | "confirming" | "done";

const STATUS_CFG: Record<string, { label: string; dot: string; text: string }> =
  {
    processing: {
      label: "Processing",
      dot: "bg-tertiary",
      text: "text-tertiary",
    },
    pending: {
      label: "Pending",
      dot: "bg-on-surface-variant",
      text: "text-on-surface-variant",
    },
    completed: { label: "Completed", dot: "bg-primary", text: "text-primary" },
    failed: { label: "Failed", dot: "bg-error", text: "text-error" },
  };

function fmt(n: number | null | undefined, prefix = "") {
  if (n == null) return "—";
  return (
    prefix +
    n.toLocaleString("pt-BR", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })
  );
}

export default function ImportPage() {
  const router = useRouter();
  const { activeMei } = useMeiContext();
  const meiId = activeMei?.id ?? "";

  const previewMutation = usePreviewImport(meiId);
  const confirmMutation = useConfirmImport(meiId);

  const [step, setStep] = useState<Step>("upload");
  const [preview, setPreview] = useState<ImportPreview | null>(null);
  const [activeTab, setActiveTab] = useState<
    "transactions" | "products" | "employees"
  >("transactions");
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  async function handleFile(file: File) {
    setStep("previewing");
    try {
      const result = await previewMutation.mutateAsync(file);
      setPreview(result);
      setActiveTab("transactions");
      setStep("preview");
    } catch {
      setStep("upload");
    }
  }

  async function handleConfirm() {
    if (!preview) return;
    setStep("confirming");
    try {
      await confirmMutation.mutateAsync(preview);
      setStep("done");
    } catch {
      setStep("preview");
    }
  }

  function handleReset() {
    setStep("upload");
    setPreview(null);
    previewMutation.reset();
    confirmMutation.reset();
  }

  // ─── Upload Step ────────────────────────────────────────────────────────────
  if (step === "upload") {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="font-display text-display-sm font-bold text-on-surface">
            Data Ingestion
          </h1>
          <p className="text-on-surface-variant text-sm mt-1">
            Faça upload de uma planilha CSV ou XLSX para importar transações,
            produtos e funcionários.
          </p>
        </div>

        {previewMutation.isError && (
          <div className="px-4 py-3 rounded-lg bg-error/10 border border-error/20 text-error text-sm">
            Falha ao processar o arquivo. Verifique o formato e tente novamente.
          </div>
        )}

        <div
          onDragOver={(e) => {
            e.preventDefault();
            setDragOver(true);
          }}
          onDragLeave={() => setDragOver(false)}
          onDrop={(e) => {
            e.preventDefault();
            setDragOver(false);
            const file = e.dataTransfer.files[0];
            if (file) handleFile(file);
          }}
          className={`bg-surface-container rounded-xl p-12 border-2 border-dashed flex flex-col items-center justify-center gap-4 text-center transition-colors
            ${dragOver ? "border-primary/60 bg-primary/5" : "border-outline-variant/30 hover:border-primary/40"}`}
        >
          <div className="w-16 h-16 rounded-2xl bg-primary-container/10 border border-primary-container/20 flex items-center justify-center">
            <span
              className="material-symbols-outlined text-primary text-3xl"
              style={{ fontVariationSettings: "'FILL' 1" }}
            >
              cloud_upload
            </span>
          </div>
          <div>
            <p className="text-on-surface font-headline font-semibold text-base mb-1">
              Arraste seu arquivo aqui
            </p>
            <p className="text-on-surface-variant text-sm">
              CSV ou XLSX — até 10 MB
            </p>
          </div>
          <button
            onClick={() => fileInputRef.current?.click()}
            className="px-5 py-2 prism-gradient rounded-lg text-[#002979] text-sm font-semibold hover:brightness-110 transition-all"
          >
            Escolher arquivo
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept=".csv,.xlsx"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) handleFile(file);
            }}
          />
        </div>
      </div>
    );
  }

  // ─── Processing Spinner ─────────────────────────────────────────────────────
  if (step === "previewing" || step === "confirming") {
    const label =
      step === "previewing" ? "Processando arquivo…" : "Salvando dados…";
    const sub =
      step === "previewing"
        ? "O LUMEMEI AI está classificando os dados da planilha."
        : "Persistindo transações, produtos e funcionários.";
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-6 text-center">
        <span className="material-symbols-outlined text-primary text-5xl animate-spin">
          progress_activity
        </span>
        <div>
          <p className="font-headline font-bold text-on-surface text-xl">
            {label}
          </p>
          <p className="text-on-surface-variant text-sm mt-1">{sub}</p>
        </div>
      </div>
    );
  }

  // ─── Done ───────────────────────────────────────────────────────────────────
  if (step === "done") {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-6 text-center">
        <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center">
          <span
            className="material-symbols-outlined text-primary text-4xl"
            style={{ fontVariationSettings: "'FILL' 1" }}
          >
            check_circle
          </span>
        </div>
        <div>
          <p className="font-headline font-bold text-on-surface text-2xl">
            Importação concluída!
          </p>
          <p className="text-on-surface-variant text-sm mt-1">
            {preview?.processedRows} registros salvos com sucesso.
          </p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={handleReset}
            className="px-5 py-2.5 rounded-lg border border-outline-variant/30 text-on-surface text-sm font-semibold hover:bg-surface-container-high transition-all"
          >
            Nova importação
          </button>
          <button
            onClick={() => router.push("/dashboard")}
            className="px-5 py-2.5 prism-gradient rounded-lg text-[#002979] text-sm font-semibold hover:brightness-110 transition-all"
          >
            Ir ao dashboard
          </button>
        </div>
      </div>
    );
  }

  // ─── Preview Step ───────────────────────────────────────────────────────────
  if (!preview) return null;

  const tabs = [
    {
      key: "transactions" as const,
      label: "Transações",
      count: preview.transactions.length,
      icon: "receipt_long",
    },
    {
      key: "products" as const,
      label: "Produtos",
      count: preview.products.length,
      icon: "inventory_2",
    },
    {
      key: "employees" as const,
      label: "Funcionários",
      count: preview.employees.length,
      icon: "group",
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="font-display text-display-sm font-bold text-on-surface">
            Revisar importação
          </h1>
          <p className="text-on-surface-variant text-sm mt-1">
            Confira os dados extraídos antes de salvar. Clique em{" "}
            <strong className="text-on-surface">Confirmar</strong> para
            persistir.
          </p>
        </div>
        <button
          onClick={handleReset}
          className="shrink-0 flex items-center gap-1.5 text-on-surface-variant text-sm hover:text-on-surface transition-colors"
        >
          <span className="material-symbols-outlined text-base">close</span>
          Cancelar
        </button>
      </div>

      {confirmMutation.isError && (
        <div className="px-4 py-3 rounded-lg bg-error/10 border border-error/20 text-error text-sm">
          Erro ao salvar os dados. Tente novamente.
        </div>
      )}

      {/* Summary Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          {
            label: "Linhas totais",
            value: preview.totalRows,
            icon: "table_rows",
          },
          {
            label: "Processadas",
            value: preview.processedRows,
            icon: "check_circle",
          },
          { label: "Erros", value: preview.errors.length, icon: "error" },
          {
            label: "Status FastAPI",
            value: preview.status,
            icon: "psychology",
          },
        ].map((c) => (
          <div
            key={c.label}
            className="bg-surface-container rounded-xl p-4 border border-white/3"
          >
            <span
              className="material-symbols-outlined text-primary text-lg"
              style={{ fontVariationSettings: "'FILL' 1" }}
            >
              {c.icon}
            </span>
            <p className="font-headline font-black text-2xl text-on-surface mt-1">
              {c.value}
            </p>
            <p className="text-on-surface-variant text-[10px] uppercase tracking-widest">
              {c.label}
            </p>
          </div>
        ))}
      </div>

      {/* Errors (if any) */}
      {preview.errors.length > 0 && (
        <div className="bg-error/5 border border-error/20 rounded-xl p-4 space-y-1">
          <p className="text-error text-xs font-semibold uppercase tracking-widest mb-2">
            Avisos do processamento
          </p>
          {preview.errors.map((e, i) => (
            <p key={i} className="text-error/80 text-sm">
              {e}
            </p>
          ))}
        </div>
      )}

      {/* Tabs */}
      <div className="bg-surface-container rounded-xl overflow-hidden border border-white/3">
        <div className="flex border-b border-outline-variant/10">
          {tabs.map((t) => (
            <button
              key={t.key}
              onClick={() => setActiveTab(t.key)}
              className={`flex items-center gap-2 px-5 py-3.5 text-sm font-semibold transition-colors
                ${
                  activeTab === t.key
                    ? "text-primary border-b-2 border-primary -mb-px"
                    : "text-on-surface-variant hover:text-on-surface"
                }`}
            >
              <span className="material-symbols-outlined text-base">
                {t.icon}
              </span>
              {t.label}
              <span
                className={`px-1.5 py-0.5 rounded text-[10px] font-bold
                ${activeTab === t.key ? "bg-primary/15 text-primary" : "bg-surface-container-high text-on-surface-variant"}`}
              >
                {t.count}
              </span>
            </button>
          ))}
        </div>

        {/* Transactions Table */}
        {activeTab === "transactions" && (
          <div className="overflow-x-auto">
            {preview.transactions.length === 0 ? (
              <p className="text-on-surface-variant text-sm text-center py-10">
                Nenhuma transação encontrada.
              </p>
            ) : (
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-outline-variant/10">
                    {["Tipo", "Categoria", "Valor", "Data", "Descrição"].map(
                      (h) => (
                        <th
                          key={h}
                          className="text-left px-5 py-3 text-on-surface-variant text-[10px] uppercase tracking-widest font-semibold"
                        >
                          {h}
                        </th>
                      ),
                    )}
                  </tr>
                </thead>
                <tbody className="divide-y divide-outline-variant/10">
                  {preview.transactions.map((tx, i) => (
                    <tr
                      key={i}
                      className="hover:bg-surface-container-high transition-colors"
                    >
                      <td className="px-5 py-3">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase
                            ${tx.type === "income" ? "bg-primary/10 text-primary" : "bg-error/10 text-error"}`}
                        >
                          {tx.type === "income" ? "Receita" : "Despesa"}
                        </span>
                      </td>
                      <td className="px-5 py-3 text-on-surface-variant">
                        {tx.category ?? "—"}
                      </td>
                      <td className="px-5 py-3 text-on-surface font-semibold">
                        {fmt(tx.amount, "R$ ")}
                      </td>
                      <td className="px-5 py-3 text-on-surface-variant">
                        {tx.date}
                      </td>
                      <td className="px-5 py-3 text-on-surface-variant truncate max-w-[200px]">
                        {tx.description ?? "—"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}

        {/* Products Table */}
        {activeTab === "products" && (
          <div className="overflow-x-auto">
            {preview.products.length === 0 ? (
              <p className="text-on-surface-variant text-sm text-center py-10">
                Nenhum produto encontrado.
              </p>
            ) : (
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-outline-variant/10">
                    {["Nome", "Custo", "Preço", "Margem desejada"].map((h) => (
                      <th
                        key={h}
                        className="text-left px-5 py-3 text-on-surface-variant text-[10px] uppercase tracking-widest font-semibold"
                      >
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-outline-variant/10">
                  {preview.products.map((p, i) => (
                    <tr
                      key={i}
                      className="hover:bg-surface-container-high transition-colors"
                    >
                      <td className="px-5 py-3 text-on-surface font-semibold">
                        {p.name}
                      </td>
                      <td className="px-5 py-3 text-on-surface-variant">
                        {fmt(p.cost, "R$ ")}
                      </td>
                      <td className="px-5 py-3 text-on-surface-variant">
                        {fmt(p.price, "R$ ")}
                      </td>
                      <td className="px-5 py-3 text-on-surface-variant">
                        {p.desiredMargin != null ? `${p.desiredMargin}%` : "—"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}

        {/* Employees Table */}
        {activeTab === "employees" && (
          <div className="overflow-x-auto">
            {preview.employees.length === 0 ? (
              <p className="text-on-surface-variant text-sm text-center py-10">
                Nenhum funcionário encontrado.
              </p>
            ) : (
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-outline-variant/10">
                    {["Nome", "Tipo contrato", "Salário", "Encargos"].map(
                      (h) => (
                        <th
                          key={h}
                          className="text-left px-5 py-3 text-on-surface-variant text-[10px] uppercase tracking-widest font-semibold"
                        >
                          {h}
                        </th>
                      ),
                    )}
                  </tr>
                </thead>
                <tbody className="divide-y divide-outline-variant/10">
                  {preview.employees.map((e, i) => (
                    <tr
                      key={i}
                      className="hover:bg-surface-container-high transition-colors"
                    >
                      <td className="px-5 py-3 text-on-surface font-semibold">
                        {e.name}
                      </td>
                      <td className="px-5 py-3 text-on-surface-variant">
                        {e.contractType ?? "—"}
                      </td>
                      <td className="px-5 py-3 text-on-surface-variant">
                        {fmt(e.salary, "R$ ")}
                      </td>
                      <td className="px-5 py-3 text-on-surface-variant">
                        {fmt(e.charges, "R$ ")}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="flex items-center justify-end gap-3 pt-2">
        <button
          onClick={handleReset}
          className="px-5 py-2.5 rounded-lg border border-outline-variant/30 text-on-surface text-sm font-semibold hover:bg-surface-container-high transition-all"
        >
          Cancelar
        </button>
        <button
          onClick={handleConfirm}
          className="px-6 py-2.5 prism-gradient rounded-lg text-[#002979] text-sm font-bold hover:brightness-110 transition-all flex items-center gap-2"
        >
          <span className="material-symbols-outlined text-base">save</span>
          Confirmar e salvar
        </button>
      </div>
    </div>
  );
}
