"use client";

import { formatCurrency } from "@/utils/formatters";
import { useMeiContext } from "@/contexts/MeiContext";
import Portal from "@/components/Portal";
import {
  useTransactions,
  useCreateTransaction,
  useUpdateTransaction,
  useDeleteTransaction,
} from "@/hooks/useTransactions";
import { useState } from "react";
import type { CreateTransactionDto, TransactionResult } from "@/types";

function groupByDate<T extends { date: string }>(txs: T[]) {
  return txs.reduce<Record<string, T[]>>((acc, tx) => {
    if (!acc[tx.date]) acc[tx.date] = [];
    acc[tx.date].push(tx);
    return acc;
  }, {});
}

const EMPTY_FORM: CreateTransactionDto = {
  type: "income",
  amount: 0,
  date: new Date().toISOString().split("T")[0],
  description: "",
  category: "",
};

export default function TransactionsPage() {
  const { activeMei } = useMeiContext();
  const meiId = activeMei?.id ?? "";
  const { data: transactions = [], isLoading } = useTransactions({ meiId });
  const createTx = useCreateTransaction(meiId);
  const updateTx = useUpdateTransaction(meiId);
  const deleteTx = useDeleteTransaction(meiId);

  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState<"" | "income" | "expense">("");

  // Create modal
  const [showNew, setShowNew] = useState(false);
  const [newForm, setNewForm] = useState<CreateTransactionDto>(EMPTY_FORM);
  const [newLoading, setNewLoading] = useState(false);

  // Edit modal
  const [editTx, setEditTx] = useState<TransactionResult | null>(null);
  const [editForm, setEditForm] = useState<CreateTransactionDto>(EMPTY_FORM);
  const [editLoading, setEditLoading] = useState(false);

  // Delete confirm
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const filtered = transactions.filter((t) => {
    const matchSearch =
      search === "" ||
      (t.description ?? "").toLowerCase().includes(search.toLowerCase()) ||
      (t.category ?? "").toLowerCase().includes(search.toLowerCase());
    const matchType = typeFilter === "" || t.type.toLowerCase() === typeFilter;
    return matchSearch && matchType;
  });

  const grouped = groupByDate(filtered);
  const sortedDates = Object.keys(grouped).sort((a, b) => b.localeCompare(a));

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setNewLoading(true);
    try {
      await createTx.mutateAsync(newForm);
      setShowNew(false);
      setNewForm(EMPTY_FORM);
    } finally {
      setNewLoading(false);
    }
  }

  function openEdit(tx: TransactionResult) {
    setEditTx(tx);
    setEditForm({
      type: tx.type,
      amount: tx.amount,
      date: tx.date,
      description: tx.description ?? "",
      category: tx.category ?? "",
    });
  }

  async function handleEdit(e: React.FormEvent) {
    e.preventDefault();
    if (!editTx) return;
    setEditLoading(true);
    try {
      await updateTx.mutateAsync({ id: editTx.id, dto: editForm });
      setEditTx(null);
    } finally {
      setEditLoading(false);
    }
  }

  async function handleDelete() {
    if (!deleteId) return;
    await deleteTx.mutateAsync(deleteId);
    setDeleteId(null);
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
        <div>
          <h1 className="font-display text-4xl md:text-[3.5rem] font-bold text-on-surface leading-none tracking-tight mb-2">
            Transactions
          </h1>
          <p className="text-on-surface-variant font-body">
            {activeMei ? activeMei.name : "—"} — Revise e gerencie o
            livro-caixa.
          </p>
        </div>
        <button
          onClick={() => setShowNew(true)}
          className="prism-gradient text-[#002979] font-label text-sm font-bold py-2 px-5 rounded-lg flex items-center gap-2 hover:brightness-110 active:scale-95 active:brightness-90 transition-all cursor-pointer"
        >
          <span className="material-symbols-outlined text-lg">add</span>
          Add Transaction
        </button>
      </div>

      {/* Create Modal */}
      {showNew && (
        <Portal>
          <TxModal
            title="Nova Transação"
            form={newForm}
            setForm={setNewForm}
            onSubmit={handleCreate}
            onClose={() => setShowNew(false)}
            loading={newLoading}
          />
        </Portal>
      )}

      {/* Edit Modal */}
      {editTx && (
        <Portal>
          <TxModal
            title="Editar Transação"
            form={editForm}
            setForm={setEditForm}
            onSubmit={handleEdit}
            onClose={() => setEditTx(null)}
            loading={editLoading}
            submitLabel="Atualizar"
          />
        </Portal>
      )}

      {/* Delete Confirm */}
      {deleteId && (
        <Portal>
          <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-[#2b292c] border border-error/20 rounded-2xl p-8 w-full max-w-sm shadow-2xl">
              <span className="material-symbols-outlined text-error text-4xl mb-3 block">
                warning
              </span>
              <h2 className="font-headline text-lg font-bold text-on-surface mb-2">
                Excluir transação?
              </h2>
              <p className="text-on-surface-variant text-sm mb-6">
                Esta ação não pode ser desfeita.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setDeleteId(null)}
                  className="flex-1 py-3 border border-white/10 rounded-lg text-on-surface-variant text-sm hover:bg-white/5 active:scale-95 transition-all cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleDelete}
                  disabled={deleteTx.isPending}
                  className="flex-1 py-3 bg-error text-white font-bold text-sm rounded-lg hover:bg-error/90 active:scale-95 active:brightness-90 transition-all disabled:opacity-60 cursor-pointer flex items-center justify-center"
                >
                  {deleteTx.isPending ? (
                    <span className="material-symbols-outlined animate-spin text-base">
                      progress_activity
                    </span>
                  ) : (
                    "Excluir"
                  )}
                </button>
              </div>
            </div>
          </div>
        </Portal>
      )}

      {/* Filters */}
      <div className="bg-surface-container p-4 rounded-xl flex flex-wrap gap-4 items-center justify-between">
        <div className="flex flex-wrap gap-4 flex-1">
          <div className="bg-surface-container-lowest rounded-lg border border-outline-variant/15 flex items-center px-3 py-2 min-w-52 flex-1 md:flex-none">
            <span className="material-symbols-outlined text-on-surface-variant text-lg mr-2">
              search
            </span>
            <input
              type="text"
              placeholder="Pesquisar..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="bg-transparent border-none p-0 text-sm font-body text-on-surface focus:outline-none w-full placeholder:text-on-surface-variant/50"
            />
          </div>
          <select
            value={typeFilter}
            onChange={(e) =>
              setTypeFilter(e.target.value as "" | "income" | "expense")
            }
            className="bg-surface-container-lowest rounded-lg border border-outline-variant/15 px-3 py-2 text-sm font-label text-on-surface focus:outline-none focus:ring-1 focus:ring-primary/40 cursor-pointer"
          >
            <option value="">Todos</option>
            <option value="income">Receitas</option>
            <option value="expense">Despesas</option>
          </select>
        </div>
        <span className="text-xs text-on-surface-variant font-label">
          {filtered.length} transações
        </span>
      </div>

      {/* List */}
      {isLoading ? (
        <div className="flex items-center justify-center h-48">
          <span className="material-symbols-outlined animate-spin text-primary text-4xl">
            progress_activity
          </span>
        </div>
      ) : sortedDates.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-48 text-on-surface-variant gap-3">
          <span className="material-symbols-outlined text-4xl">
            receipt_long
          </span>
          <p className="font-body text-sm">Nenhuma transação encontrada.</p>
          <button
            onClick={() => setShowNew(true)}
            className="text-primary text-xs underline cursor-pointer"
          >
            Adicionar transação
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {sortedDates.map((date) => (
            <div key={date}>
              <h3 className="font-label text-on-surface-variant text-sm uppercase tracking-widest mt-8 mb-4 px-2">
                {date}
              </h3>
              <div className="space-y-3">
                {grouped[date].map((tx) => {
                  const isIncome = tx.type === "income";
                  return (
                    <div
                      key={tx.id}
                      className="bg-surface-container rounded-xl p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 hover:bg-surface-container-high transition-colors"
                    >
                      <div className="flex items-center gap-4 flex-1">
                        <div
                          className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${isIncome ? "bg-primary/10 text-primary" : "bg-surface-container-lowest text-on-surface-variant"}`}
                        >
                          <span className="material-symbols-outlined text-lg">
                            {isIncome ? "south_west" : "north_east"}
                          </span>
                        </div>
                        <div>
                          <h4 className="font-display font-medium text-on-surface">
                            {tx.description ?? tx.category ?? "—"}
                          </h4>
                          {tx.category && (
                            <span className="bg-surface-container-highest px-2 py-0.5 rounded text-xs font-label text-on-surface-variant border border-outline-variant/20 mt-1 inline-block">
                              {tx.category}
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-2 ml-auto flex-shrink-0">
                        <span
                          className={`font-display text-lg ${isIncome ? "text-primary" : "text-on-surface"}`}
                        >
                          {isIncome ? "+" : "-"}
                          {formatCurrency(tx.amount)}
                        </span>
                        <button
                          onClick={() => openEdit(tx)}
                          title="Editar"
                          className="w-8 h-8 flex items-center justify-center rounded-lg text-on-surface-variant border border-transparent hover:border-outline-variant/30 hover:bg-surface-container-highest hover:text-on-surface active:scale-90 active:bg-surface-container-highest transition-all cursor-pointer"
                        >
                          <span className="material-symbols-outlined text-base">
                            edit
                          </span>
                        </button>
                        <button
                          onClick={() => setDeleteId(tx.id)}
                          title="Excluir"
                          className="w-8 h-8 flex items-center justify-center rounded-lg text-on-surface-variant border border-transparent hover:border-error/30 hover:bg-error/10 hover:text-error active:scale-90 active:bg-error/20 transition-all cursor-pointer"
                        >
                          <span className="material-symbols-outlined text-base">
                            delete
                          </span>
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ── Shared Modal ───────────────────────────────────────────────────────────────

function TxModal({
  title,
  form,
  setForm,
  onSubmit,
  onClose,
  loading,
  submitLabel = "Salvar",
}: {
  title: string;
  form: CreateTransactionDto;
  setForm: React.Dispatch<React.SetStateAction<CreateTransactionDto>>;
  onSubmit: (e: React.FormEvent) => void;
  onClose: () => void;
  loading: boolean;
  submitLabel?: string;
}) {
  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-[#2b292c] border border-white/10 rounded-2xl p-8 w-full max-w-md shadow-2xl">
        <h2 className="font-headline text-xl font-bold text-on-surface mb-6">
          {title}
        </h2>
        <form onSubmit={onSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            {(["income", "expense"] as const).map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => setForm((f) => ({ ...f, type: t }))}
                className={`py-2 rounded-lg text-sm font-label border transition-all cursor-pointer active:scale-95 ${
                  form.type === t
                    ? t === "income"
                      ? "border-primary bg-primary/10 text-primary"
                      : "border-tertiary bg-tertiary/10 text-tertiary"
                    : "border-white/10 text-on-surface-variant hover:bg-white/5"
                }`}
              >
                {t === "income" ? "Receita" : "Despesa"}
              </button>
            ))}
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-xs font-label text-on-surface-variant uppercase tracking-wide">
              Valor <span className="text-error">*</span>
            </label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm text-on-surface-variant">
                R$
              </span>
              <input
                type="number"
                placeholder="0,00"
                required
                min={0.01}
                step={0.01}
                value={form.amount || ""}
                onChange={(e) =>
                  setForm((f) => ({ ...f, amount: parseFloat(e.target.value) }))
                }
                className="w-full bg-[#1c1b1d] border border-white/10 rounded-lg py-3 pl-10 pr-4 text-sm text-on-surface focus:ring-1 focus:ring-primary outline-none"
              />
            </div>
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-xs font-label text-on-surface-variant uppercase tracking-wide">
              Data <span className="text-error">*</span>
            </label>
            <input
              type="date"
              required
              value={form.date}
              onChange={(e) => setForm((f) => ({ ...f, date: e.target.value }))}
              className="w-full bg-[#1c1b1d] border border-white/10 rounded-lg py-3 px-4 text-sm text-on-surface focus:ring-1 focus:ring-primary outline-none"
            />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-xs font-label text-on-surface-variant uppercase tracking-wide">
              Descrição
            </label>
            <input
              type="text"
              placeholder="Ex: Venda de produto, Aluguel..."
              value={form.description ?? ""}
              onChange={(e) =>
                setForm((f) => ({ ...f, description: e.target.value }))
              }
              className="w-full bg-[#1c1b1d] border border-white/10 rounded-lg py-3 px-4 text-sm text-on-surface focus:ring-1 focus:ring-primary outline-none"
            />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-xs font-label text-on-surface-variant uppercase tracking-wide">
              Categoria
            </label>
            <input
              type="text"
              placeholder="Ex: Vendas, Fornecedor, Salário..."
              value={form.category ?? ""}
              onChange={(e) =>
                setForm((f) => ({ ...f, category: e.target.value }))
              }
              className="w-full bg-[#1c1b1d] border border-white/10 rounded-lg py-3 px-4 text-sm text-on-surface focus:ring-1 focus:ring-primary outline-none"
            />
          </div>
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-3 border border-white/10 rounded-lg text-on-surface-variant text-sm hover:bg-white/5 active:scale-95 active:bg-white/10 transition-all cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 py-3 prism-gradient text-[#002979] font-bold text-sm rounded-lg disabled:opacity-60 hover:brightness-110 active:scale-95 active:brightness-90 transition-all cursor-pointer flex items-center justify-center gap-2"
            >
              {loading ? (
                <span className="material-symbols-outlined animate-spin text-base">
                  progress_activity
                </span>
              ) : (
                submitLabel
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
