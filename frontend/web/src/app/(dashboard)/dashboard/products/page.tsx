"use client";

import { formatCurrency } from "@/utils/formatters";
import { useMeiContext } from "@/contexts/MeiContext";
import Portal from "@/components/Portal";
import {
  useProducts,
  useCreateProduct,
  useUpdateProduct,
  useDeleteProduct,
} from "@/hooks/useProducts";
import { useState } from "react";
import type { CreateProductDto, ProductResult } from "@/types";

const EMPTY_FORM: CreateProductDto = {
  name: "",
  cost: 0,
  price: 0,
  desiredMargin: 40,
  status: "active",
};

export default function ProductsPage() {
  const { activeMei } = useMeiContext();
  const meiId = activeMei?.id ?? "";
  const { data: products = [], isLoading } = useProducts(meiId);
  const createProduct = useCreateProduct(meiId);
  const updateProduct = useUpdateProduct(meiId);
  const deleteProduct = useDeleteProduct(meiId);

  const [showNew, setShowNew] = useState(false);
  const [newForm, setNewForm] = useState<CreateProductDto>(EMPTY_FORM);
  const [saving, setSaving] = useState(false);

  const [editProduct, setEditProduct] = useState<ProductResult | null>(null);
  const [editForm, setEditForm] = useState<CreateProductDto>(EMPTY_FORM);
  const [editSaving, setEditSaving] = useState(false);

  const [deleteId, setDeleteId] = useState<string | null>(null);

  const belowTarget = products.filter((p) => p.isMarginBelowDesired).length;
  const blendedMargin =
    products.length > 0
      ? Math.round(
          products.reduce((sum, p) => sum + (p.margin ?? 0), 0) /
            products.length,
        )
      : 0;
  const totalInventoryValue = products.reduce(
    (sum, p) => sum + (p.price ?? 0),
    0,
  );

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      await createProduct.mutateAsync(newForm);
      setShowNew(false);
      setNewForm(EMPTY_FORM);
    } finally {
      setSaving(false);
    }
  }

  function openEdit(p: ProductResult) {
    setEditProduct(p);
    setEditForm({
      name: p.name,
      cost: p.cost ?? 0,
      price: p.price ?? 0,
      desiredMargin: p.desiredMargin ?? 40,
      status: p.status ?? "active",
    });
  }

  async function handleEdit(e: React.FormEvent) {
    e.preventDefault();
    if (!editProduct) return;
    setEditSaving(true);
    try {
      await updateProduct.mutateAsync({ id: editProduct.id, dto: editForm });
      setEditProduct(null);
    } finally {
      setEditSaving(false);
    }
  }

  async function handleDelete() {
    if (!deleteId) return;
    await deleteProduct.mutateAsync(deleteId);
    setDeleteId(null);
  }

  return (
    <div className="space-y-12">
      {/* Header */}
      <header className="flex justify-between items-end">
        <div>
          <h1 className="font-display text-5xl text-on-surface mb-3 tracking-tighter font-medium">
            Products
          </h1>
          <p className="text-on-surface-variant font-body text-sm max-w-md">
            Análise de rentabilidade — {activeMei?.name ?? "—"}
          </p>
        </div>
        <button
          onClick={() => setShowNew(true)}
          className="prism-gradient text-[#002979] font-label font-bold text-sm px-5 py-2.5 rounded-lg flex items-center gap-2 hover:brightness-110 active:scale-95 active:brightness-90 transition-all cursor-pointer"
        >
          <span className="material-symbols-outlined text-lg">add</span>
          Novo Produto
        </button>
      </header>

      {/* Create Modal */}
      {showNew && (
        <Portal>
          <ProductModal
            title="Novo Produto"
            form={newForm}
            setForm={setNewForm}
            onSubmit={handleCreate}
            onClose={() => setShowNew(false)}
            loading={saving}
          />
        </Portal>
      )}

      {/* Edit Modal */}
      {editProduct && (
        <Portal>
          <ProductModal
            title="Editar Produto"
            form={editForm}
            setForm={setEditForm}
            onSubmit={handleEdit}
            onClose={() => setEditProduct(null)}
            loading={editSaving}
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
                Excluir produto?
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
                  disabled={deleteProduct.isPending}
                  className="flex-1 py-3 bg-error text-white font-bold text-sm rounded-lg hover:bg-error/90 active:scale-95 active:brightness-90 transition-all disabled:opacity-60 cursor-pointer flex items-center justify-center"
                >
                  {deleteProduct.isPending ? (
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

      {/* Executive Summary */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-surface-container rounded-lg p-6 relative overflow-hidden">
          <p className="font-label text-sm text-on-surface-variant uppercase tracking-widest mb-4">
            Valor Total (Preços)
          </p>
          <h2 className="font-display text-4xl text-on-surface tracking-tight">
            {formatCurrency(totalInventoryValue)}
          </h2>
          <p className="mt-2 text-xs font-label text-on-surface-variant">
            {products.length} produto(s) cadastrado(s)
          </p>
        </div>
        <div className="bg-surface-container rounded-lg p-6">
          <p className="font-label text-sm text-on-surface-variant uppercase tracking-widest mb-4">
            Margem Média
          </p>
          <h2 className="font-display text-4xl text-primary-container tracking-tight">
            {blendedMargin}%
          </h2>
          <div className="mt-4 h-1.5 w-full bg-surface-container-lowest rounded-full overflow-hidden">
            <div
              className="h-full bg-primary-container rounded-full transition-all"
              style={{ width: `${Math.min(blendedMargin, 100)}%` }}
            />
          </div>
        </div>
        <div className="bg-surface-container rounded-lg p-6 flex flex-col justify-between">
          <div>
            <p className="font-label text-sm text-on-surface-variant uppercase tracking-widest mb-4">
              Alerta de Rentabilidade
            </p>
            <h2 className="font-display text-2xl text-on-surface tracking-tight leading-tight">
              {belowTarget > 0
                ? `${belowTarget} produto(s) abaixo da margem desejada.`
                : "Todos os produtos estão dentro da meta!"}
            </h2>
          </div>
        </div>
      </section>

      {/* Product Portfolio */}
      <section>
        <div className="flex justify-between items-center mb-6 px-2">
          <h2 className="font-headline text-lg text-on-surface tracking-tight">
            Portfólio Ativo
          </h2>
        </div>
        {isLoading ? (
          <div className="flex items-center justify-center h-48">
            <span className="material-symbols-outlined animate-spin text-primary text-4xl">
              progress_activity
            </span>
          </div>
        ) : products.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-48 text-on-surface-variant gap-3">
            <span className="material-symbols-outlined text-4xl">
              inventory_2
            </span>
            <p className="font-body text-sm">Nenhum produto cadastrado.</p>
            <button
              onClick={() => setShowNew(true)}
              className="text-primary text-xs underline cursor-pointer"
            >
              Adicionar produto
            </button>
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            {products.map((p) => {
              const margin = p.margin ?? 0;
              const status = p.isMarginBelowDesired
                ? margin < 0
                  ? "critical"
                  : "warning"
                : "healthy";
              const marginColor =
                status === "critical"
                  ? "text-error"
                  : status === "warning"
                    ? "text-tertiary"
                    : "text-primary-container";
              const barColor =
                status === "critical"
                  ? "bg-error"
                  : status === "warning"
                    ? "bg-tertiary"
                    : "bg-primary-container";
              const desiredMargin = p.desiredMargin ?? 0;

              return (
                <div
                  key={p.id}
                  className={`bg-surface-container rounded-lg p-5 flex items-center justify-between hover:bg-surface-container-high transition-colors ${status === "critical" ? "border border-error/10" : ""}`}
                >
                  <div className="flex items-center gap-5 flex-1 min-w-0">
                    <div className="w-10 h-10 rounded bg-surface-container-lowest flex-shrink-0 flex items-center justify-center border border-outline-variant/15">
                      <span className="material-symbols-outlined text-on-surface-variant text-base">
                        inventory_2
                      </span>
                    </div>
                    <div className="min-w-0">
                      <h3 className="font-headline text-base text-on-surface truncate">
                        {p.name}
                      </h3>
                      <div className="flex items-center gap-3 mt-1 text-xs text-on-surface-variant">
                        <span>Custo: {formatCurrency(p.cost ?? 0)}</span>
                        <span>Preço: {formatCurrency(p.price ?? 0)}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-6 ml-4 flex-shrink-0">
                    <div className="hidden md:block w-32">
                      <div className="flex justify-between text-xs mb-1">
                        <span className={marginColor}>
                          {margin.toFixed(1)}%
                        </span>
                        <span className="text-on-surface-variant/60">
                          meta {desiredMargin}%
                        </span>
                      </div>
                      <div className="h-1.5 w-full bg-surface-container-lowest rounded-full overflow-hidden">
                        <div
                          className={`h-full ${barColor} rounded-full transition-all`}
                          style={{
                            width: `${Math.min(Math.max(margin, 0), 100)}%`,
                          }}
                        />
                      </div>
                    </div>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => openEdit(p)}
                        title="Editar"
                        className="w-8 h-8 flex items-center justify-center rounded-lg text-on-surface-variant border border-transparent hover:border-outline-variant/30 hover:bg-surface-container-highest hover:text-on-surface active:scale-90 active:bg-surface-container-highest transition-all cursor-pointer"
                      >
                        <span className="material-symbols-outlined text-base">
                          edit
                        </span>
                      </button>
                      <button
                        onClick={() => setDeleteId(p.id)}
                        title="Excluir"
                        className="w-8 h-8 flex items-center justify-center rounded-lg text-on-surface-variant border border-transparent hover:border-error/30 hover:bg-error/10 hover:text-error active:scale-90 active:bg-error/20 transition-all cursor-pointer"
                      >
                        <span className="material-symbols-outlined text-base">
                          delete
                        </span>
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}

// ── Product Modal ─────────────────────────────────────────────────────────────

function ProductModal({
  title,
  form,
  setForm,
  onSubmit,
  onClose,
  loading,
  submitLabel = "Salvar",
}: {
  title: string;
  form: CreateProductDto;
  setForm: React.Dispatch<React.SetStateAction<CreateProductDto>>;
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
          <div className="flex flex-col gap-1">
            <label className="text-xs font-label text-on-surface-variant uppercase tracking-wide">
              Nome do produto <span className="text-error">*</span>
            </label>
            <input
              type="text"
              placeholder="Ex: Camiseta preta P"
              required
              value={form.name}
              onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
              className="w-full bg-[#1c1b1d] border border-white/10 rounded-lg py-3 px-4 text-sm text-on-surface focus:ring-1 focus:ring-primary outline-none"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1">
              <label className="text-xs font-label text-on-surface-variant uppercase tracking-wide">
                Custo (R$)
              </label>
              <input
                type="number"
                placeholder="0,00"
                min={0}
                step={0.01}
                value={form.cost ?? ""}
                onChange={(e) =>
                  setForm((f) => ({
                    ...f,
                    cost: parseFloat(e.target.value) || 0,
                  }))
                }
                className="w-full bg-[#1c1b1d] border border-white/10 rounded-lg py-3 px-4 text-sm text-on-surface focus:ring-1 focus:ring-primary outline-none"
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-xs font-label text-on-surface-variant uppercase tracking-wide">
                Preço de venda (R$)
              </label>
              <input
                type="number"
                placeholder="0,00"
                min={0}
                step={0.01}
                value={form.price ?? ""}
                onChange={(e) =>
                  setForm((f) => ({
                    ...f,
                    price: parseFloat(e.target.value) || 0,
                  }))
                }
                className="w-full bg-[#1c1b1d] border border-white/10 rounded-lg py-3 px-4 text-sm text-on-surface focus:ring-1 focus:ring-primary outline-none"
              />
            </div>
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-xs font-label text-on-surface-variant uppercase tracking-wide">
              Margem desejada (%)
            </label>
            <input
              type="number"
              placeholder="Ex: 40"
              min={0}
              max={100}
              value={form.desiredMargin ?? ""}
              onChange={(e) =>
                setForm((f) => ({
                  ...f,
                  desiredMargin: parseFloat(e.target.value) || 0,
                }))
              }
              className="w-full bg-[#1c1b1d] border border-white/10 rounded-lg py-3 px-4 text-sm text-on-surface focus:ring-1 focus:ring-primary outline-none"
            />
            <p className="text-xs text-on-surface-variant/60">
              Percentual mínimo de lucro que você quer neste produto
            </p>
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
