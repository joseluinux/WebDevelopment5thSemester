"use client";

import { formatCurrency } from "@/utils/formatters";
import { useMeiContext } from "@/contexts/MeiContext";
import Portal from "@/components/Portal";
import { useEmployees, useCreateEmployee } from "@/hooks/useEmployees";
import { useState } from "react";
import type { CreateEmployeeDto } from "@/types";

const EMPTY_FORM: CreateEmployeeDto = {
  name: "",
  contractType: "",
  salary: 0,
  charges: 0,
};

export default function EmployeesPage() {
  const { activeMei } = useMeiContext();
  const meiId = activeMei?.id ?? "";
  const { data: employees = [], isLoading } = useEmployees(meiId);
  const createEmployee = useCreateEmployee(meiId);

  const [showNew, setShowNew] = useState(false);
  const [form, setForm] = useState<CreateEmployeeDto>(EMPTY_FORM);
  const [saving, setSaving] = useState(false);

  const totalPayroll = employees.reduce((sum, e) => sum + (e.salary ?? 0), 0);
  const activeCount = employees.length;

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      await createEmployee.mutateAsync(form);
      setShowNew(false);
      setForm(EMPTY_FORM);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-12">
      {/* Header */}
      <header className="flex justify-between items-end">
        <div>
          <h1 className="font-display text-5xl text-on-surface mb-3 tracking-tighter font-medium">
            Employees
          </h1>
          <p className="text-on-surface-variant font-body text-sm max-w-md">
            Gerencie a equipe do {activeMei?.name ?? "—"}
          </p>
        </div>
        <button
          onClick={() => setShowNew(true)}
          className="prism-gradient text-[#002979] font-label font-bold text-sm px-5 py-2.5 rounded-lg flex items-center gap-2 hover:brightness-110 active:scale-95 active:brightness-90 transition-all cursor-pointer"
        >
          <span className="material-symbols-outlined text-lg">person_add</span>
          Novo Funcionário
        </button>
      </header>

      {/* Create Modal */}
      {showNew && (
        <Portal>
          <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-[#2b292c] border border-white/10 rounded-2xl p-8 w-full max-w-md shadow-2xl">
              <h2 className="font-headline text-xl font-bold text-on-surface mb-6">
                Novo Funcionário
              </h2>
              <form onSubmit={handleCreate} className="space-y-4">
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-label text-on-surface-variant uppercase tracking-wide">
                    Nome completo <span className="text-error">*</span>
                  </label>
                  <input
                    type="text"
                    placeholder="Ex: João Silva"
                    required
                    value={form.name}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, name: e.target.value }))
                    }
                    className="w-full bg-[#1c1b1d] border border-white/10 rounded-lg py-3 px-4 text-sm text-on-surface focus:ring-1 focus:ring-primary outline-none"
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-label text-on-surface-variant uppercase tracking-wide">
                    Tipo de contrato <span className="text-error">*</span>
                  </label>
                  <select
                    required
                    value={form.contractType ?? ""}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, contractType: e.target.value }))
                    }
                    className="w-full bg-[#1c1b1d] border border-white/10 rounded-lg py-3 px-4 text-sm text-on-surface focus:ring-1 focus:ring-primary outline-none"
                  >
                    <option value="" disabled>
                      Selecione...
                    </option>
                    <option value="clt">CLT</option>
                    <option value="pj">PJ (Pessoa Jurídica)</option>
                    <option value="intern">Estagiário</option>
                  </select>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="flex flex-col gap-1">
                    <label className="text-xs font-label text-on-surface-variant uppercase tracking-wide">
                      Salário (R$)
                    </label>
                    <input
                      type="number"
                      placeholder="0,00"
                      min={0.01}
                      step={0.01}
                      required
                      value={form.salary || ""}
                      onChange={(e) =>
                        setForm((f) => ({
                          ...f,
                          salary: parseFloat(e.target.value) || 0,
                        }))
                      }
                      className="w-full bg-[#1c1b1d] border border-white/10 rounded-lg py-3 px-4 text-sm text-on-surface focus:ring-1 focus:ring-primary outline-none"
                    />
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-xs font-label text-on-surface-variant uppercase tracking-wide">
                      Encargos (R$)
                    </label>
                    <input
                      type="number"
                      placeholder="0,00"
                      min={0}
                      step={0.01}
                      value={form.charges ?? ""}
                      onChange={(e) =>
                        setForm((f) => ({
                          ...f,
                          charges: parseFloat(e.target.value) || 0,
                        }))
                      }
                      className="w-full bg-[#1c1b1d] border border-white/10 rounded-lg py-3 px-4 text-sm text-on-surface focus:ring-1 focus:ring-primary outline-none"
                    />
                  </div>
                </div>
                <div className="flex gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowNew(false)}
                    className="flex-1 py-3 border border-white/10 rounded-lg text-on-surface-variant text-sm hover:bg-white/5 active:scale-95 active:bg-white/10 transition-all cursor-pointer"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    disabled={saving}
                    className="flex-1 py-3 prism-gradient text-[#002979] font-bold text-sm rounded-lg disabled:opacity-60 hover:brightness-110 active:scale-95 active:brightness-90 transition-all cursor-pointer flex items-center justify-center gap-2"
                  >
                    {saving ? (
                      <span className="material-symbols-outlined animate-spin text-base">
                        progress_activity
                      </span>
                    ) : (
                      "Salvar"
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </Portal>
      )}

      {/* Payroll Summary */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-surface-container rounded-lg p-6">
          <p className="font-label text-sm text-on-surface-variant uppercase tracking-widest mb-4">
            Folha Total
          </p>
          <h2 className="font-display text-4xl text-on-surface tracking-tight">
            {formatCurrency(totalPayroll)}
          </h2>
          <p className="mt-2 text-xs text-on-surface-variant">por mês</p>
        </div>
        <div className="bg-surface-container rounded-lg p-6">
          <p className="font-label text-sm text-on-surface-variant uppercase tracking-widest mb-4">
            Funcionários Ativos
          </p>
          <h2 className="font-display text-4xl text-primary-container tracking-tight">
            {activeCount}
          </h2>
          <p className="mt-2 text-xs text-on-surface-variant">
            de {employees.length} total
          </p>
        </div>
        <div className="bg-surface-container rounded-lg p-6">
          <p className="font-label text-sm text-on-surface-variant uppercase tracking-widest mb-4">
            Média Salarial
          </p>
          <h2 className="font-display text-4xl text-on-surface tracking-tight">
            {employees.length > 0
              ? formatCurrency(totalPayroll / employees.length)
              : "—"}
          </h2>
        </div>
      </section>

      {/* Employee List */}
      <section>
        <h2 className="font-headline text-lg text-on-surface tracking-tight mb-6 px-2">
          Equipe
        </h2>
        {isLoading ? (
          <div className="flex items-center justify-center h-48">
            <span className="material-symbols-outlined animate-spin text-primary text-4xl">
              progress_activity
            </span>
          </div>
        ) : employees.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-48 text-on-surface-variant gap-3">
            <span className="material-symbols-outlined text-4xl">group</span>
            <p className="font-body text-sm">Nenhum funcionário cadastrado.</p>
            <button
              onClick={() => setShowNew(true)}
              className="text-primary text-xs underline cursor-pointer"
            >
              Adicionar funcionário
            </button>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {employees.map((emp) => (
              <div
                key={emp.id}
                className="bg-surface-container rounded-xl p-5 flex items-center gap-5 hover:bg-surface-container-high transition-colors"
              >
                <div className="w-10 h-10 rounded-full bg-surface-container-highest flex items-center justify-center flex-shrink-0 text-on-surface-variant">
                  <span className="material-symbols-outlined text-base">
                    person
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-headline text-base text-on-surface truncate">
                    {emp.name}
                  </h3>
                  <p className="text-sm text-on-surface-variant truncate">
                    {emp.contractType ?? "Sem contrato"}
                  </p>
                </div>
                <div className="text-right flex-shrink-0">
                  <p className="font-display text-base text-on-surface">
                    {formatCurrency(emp.salary ?? 0)}
                  </p>
                  {emp.charges != null && emp.charges > 0 && (
                    <p className="text-xs text-on-surface-variant mt-0.5">
                      Encargos: {formatCurrency(emp.charges)}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
