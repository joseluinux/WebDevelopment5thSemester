"use client";

import { useState } from "react";
import { formatCurrency } from "@/utils/formatters";
import { useAuth } from "@/hooks/useAuth";
import { useMeiContext } from "@/contexts/MeiContext";
import { useUpdateProfile, useDeleteAccount } from "@/hooks/useProfile";
import { useUpdateMei, useDeleteMei } from "@/hooks/useMeis";
import { useRouter } from "next/navigation";

export default function SettingsPage() {
  const { user, logout } = useAuth();
  const { activeMei, meis, refetchMeis } = useMeiContext();
  const updateProfile = useUpdateProfile();
  const deleteAccount = useDeleteAccount();
  const updateMei = useUpdateMei(activeMei?.id ?? "");
  const deleteMei = useDeleteMei();
  const router = useRouter();

  // Profile editing
  const [editProfile, setEditProfile] = useState(false);
  const [profileForm, setProfileForm] = useState({
    name: user?.name ?? "",
    email: user?.email ?? "",
  });
  const [profileSaving, setProfileSaving] = useState(false);
  const [profileError, setProfileError] = useState<string | null>(null);

  // MEI editing
  const [editMei, setEditMei] = useState(false);
  const [meiForm, setMeiForm] = useState({
    name: activeMei?.name ?? "",
    cnae: activeMei?.cnae ?? "",
  });
  const [meiSaving, setMeiSaving] = useState(false);

  const annualLimit = activeMei?.annualLimit ?? 81000;
  const initials = user?.name
    ? user.name
        .split(" ")
        .slice(0, 2)
        .map((n) => n[0])
        .join("")
        .toUpperCase()
    : (user?.email?.[0]?.toUpperCase() ?? "?");

  async function handleSaveProfile(e: React.FormEvent) {
    e.preventDefault();
    setProfileSaving(true);
    setProfileError(null);
    try {
      await updateProfile.mutateAsync({
        name: profileForm.name,
        email: profileForm.email,
      });
      setEditProfile(false);
    } catch {
      setProfileError("Erro ao atualizar perfil.");
    } finally {
      setProfileSaving(false);
    }
  }

  async function handleSaveMei(e: React.FormEvent) {
    e.preventDefault();
    if (!activeMei) return;
    setMeiSaving(true);
    try {
      await updateMei.mutateAsync({
        name: meiForm.name,
        cnae: meiForm.cnae || undefined,
      });
      refetchMeis();
      setEditMei(false);
    } finally {
      setMeiSaving(false);
    }
  }

  async function handleDeleteAccount() {
    if (
      !confirm(
        "Tem certeza? Esta ação é irreversível e apagará todos os seus dados.",
      )
    )
      return;
    await deleteAccount.mutateAsync();
    await logout();
    router.push("/");
  }

  async function handleDeleteMei() {
    if (!activeMei) return;
    if (!confirm(`Tem certeza que deseja excluir o MEI "${activeMei.name}"?`))
      return;
    await deleteMei.mutateAsync(activeMei.id);
    refetchMeis();
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="font-display text-4xl font-bold text-on-surface">
          Settings
        </h1>
        <p className="text-on-surface-variant text-sm mt-1">
          Gerencie seu perfil e dados do MEI.
        </p>
      </div>

      <div className="grid lg:grid-cols-12 gap-6">
        <div className="lg:col-span-9 space-y-6">
          {/* Personal Profile */}
          <div className="bg-surface-container rounded-xl p-6">
            <div className="flex items-center justify-between mb-6">
              <p className="text-on-surface font-headline font-bold text-lg">
                Perfil Pessoal
              </p>
              <button
                onClick={() => {
                  setEditProfile((v) => !v);
                  setProfileForm({
                    name: user?.name ?? "",
                    email: user?.email ?? "",
                  });
                }}
                className="flex items-center gap-1 text-primary text-xs font-semibold hover:text-primary-container transition-colors"
              >
                {editProfile ? "Cancelar" : "Editar"}
                <span className="material-symbols-outlined text-base">
                  edit
                </span>
              </button>
            </div>

            <div className="flex items-start gap-6">
              <div className="w-16 h-16 rounded-full bg-primary-container/10 border border-primary-container/20 flex items-center justify-center font-headline font-bold text-primary text-xl shrink-0">
                {initials}
              </div>
              {editProfile ? (
                <form onSubmit={handleSaveProfile} className="flex-1 space-y-4">
                  {profileError && (
                    <p className="text-error text-sm">{profileError}</p>
                  )}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <p className="text-on-surface-variant text-[10px] uppercase tracking-widest font-semibold mb-1">
                        Nome
                      </p>
                      <input
                        type="text"
                        value={profileForm.name}
                        onChange={(e) =>
                          setProfileForm((f) => ({
                            ...f,
                            name: e.target.value,
                          }))
                        }
                        className="w-full bg-surface-container-lowest border border-outline-variant/20 rounded-lg px-4 py-3 text-on-surface text-sm focus:ring-1 focus:ring-primary outline-none"
                      />
                    </div>
                    <div>
                      <p className="text-on-surface-variant text-[10px] uppercase tracking-widest font-semibold mb-1">
                        E-mail
                      </p>
                      <input
                        type="email"
                        required
                        value={profileForm.email}
                        onChange={(e) =>
                          setProfileForm((f) => ({
                            ...f,
                            email: e.target.value,
                          }))
                        }
                        className="w-full bg-surface-container-lowest border border-outline-variant/20 rounded-lg px-4 py-3 text-on-surface text-sm focus:ring-1 focus:ring-primary outline-none"
                      />
                    </div>
                  </div>
                  <button
                    type="submit"
                    disabled={profileSaving}
                    className="prism-gradient text-[#002979] font-bold text-sm px-5 py-2 rounded-lg disabled:opacity-60 flex items-center gap-2"
                  >
                    {profileSaving ? (
                      <span className="material-symbols-outlined animate-spin text-base">
                        progress_activity
                      </span>
                    ) : (
                      "Salvar Alterações"
                    )}
                  </button>
                </form>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 flex-1">
                  <div>
                    <p className="text-on-surface-variant text-[10px] uppercase tracking-widest font-semibold mb-1">
                      Nome
                    </p>
                    <div className="bg-surface-container-high rounded-lg px-4 py-3 text-on-surface text-sm">
                      {user?.name ?? "—"}
                    </div>
                  </div>
                  <div>
                    <p className="text-on-surface-variant text-[10px] uppercase tracking-widest font-semibold mb-1">
                      E-mail
                    </p>
                    <div className="bg-surface-container-high rounded-lg px-4 py-3 text-on-surface text-sm">
                      {user?.email ?? "—"}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Annual Revenue Limit */}
          <div className="bg-surface-container rounded-xl p-6">
            <p className="text-on-surface-variant text-[10px] uppercase tracking-widest font-semibold mb-3">
              Limite de Receita Anual
            </p>
            <p className="font-headline font-bold text-2xl text-on-surface mb-1">
              {formatCurrency(annualLimit)}
            </p>
            <p className="text-on-surface-variant text-xs mb-3">
              limite anual configurado para o MEI ativo
            </p>
            <div className="h-2 w-full bg-surface-container-high rounded-full overflow-hidden">
              <div className="h-full prism-gradient rounded-full w-0" />
            </div>
          </div>

          {/* Business Details */}
          {activeMei && (
            <div className="bg-surface-container rounded-xl p-6">
              <div className="flex items-center justify-between mb-4">
                <p className="text-on-surface font-headline font-bold">
                  Dados do MEI
                </p>
                <button
                  onClick={() => {
                    setEditMei((v) => !v);
                    setMeiForm({
                      name: activeMei.name,
                      cnae: activeMei.cnae ?? "",
                    });
                  }}
                  className="flex items-center gap-1 text-primary text-xs font-semibold hover:text-primary-container transition-colors"
                >
                  {editMei ? "Cancelar" : "Editar"}
                  <span className="material-symbols-outlined text-base">
                    edit
                  </span>
                </button>
              </div>
              {editMei ? (
                <form onSubmit={handleSaveMei} className="space-y-4">
                  <input
                    type="text"
                    placeholder="Nome do MEI"
                    required
                    value={meiForm.name}
                    onChange={(e) =>
                      setMeiForm((f) => ({ ...f, name: e.target.value }))
                    }
                    className="w-full bg-surface-container-lowest border border-outline-variant/20 rounded-lg px-4 py-3 text-on-surface text-sm focus:ring-1 focus:ring-primary outline-none"
                  />
                  <input
                    type="text"
                    placeholder="CNAE (opcional)"
                    value={meiForm.cnae}
                    onChange={(e) =>
                      setMeiForm((f) => ({ ...f, cnae: e.target.value }))
                    }
                    className="w-full bg-surface-container-lowest border border-outline-variant/20 rounded-lg px-4 py-3 text-on-surface text-sm focus:ring-1 focus:ring-primary outline-none"
                  />
                  <button
                    type="submit"
                    disabled={meiSaving}
                    className="prism-gradient text-[#002979] font-bold text-sm px-5 py-2 rounded-lg disabled:opacity-60 flex items-center gap-2"
                  >
                    {meiSaving ? (
                      <span className="material-symbols-outlined animate-spin text-base">
                        progress_activity
                      </span>
                    ) : (
                      "Salvar MEI"
                    )}
                  </button>
                </form>
              ) : (
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-on-surface-variant text-[10px] uppercase tracking-widest font-semibold mb-1">
                      Nome
                    </p>
                    <div className="bg-surface-container-high rounded-lg px-4 py-3 text-on-surface text-sm">
                      {activeMei.name}
                    </div>
                  </div>
                  <div>
                    <p className="text-on-surface-variant text-[10px] uppercase tracking-widest font-semibold mb-1">
                      CNPJ
                    </p>
                    <div className="bg-surface-container-high rounded-lg px-4 py-3 text-on-surface text-sm">
                      {activeMei.cnpj ?? "—"}
                    </div>
                  </div>
                  <div>
                    <p className="text-on-surface-variant text-[10px] uppercase tracking-widest font-semibold mb-1">
                      CNAE
                    </p>
                    <div className="bg-surface-container-high rounded-lg px-4 py-3 text-on-surface text-sm">
                      {activeMei.cnae ?? "—"}
                    </div>
                  </div>
                  <div>
                    <p className="text-on-surface-variant text-[10px] uppercase tracking-widest font-semibold mb-1">
                      Plano
                    </p>
                    <div className="flex items-center gap-2 mt-1">
                      <span
                        className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest border ${
                          (activeMei.plan ?? "").toLowerCase() === "pro"
                            ? "bg-primary/10 text-primary border-primary/20"
                            : (activeMei.plan ?? "").toLowerCase() ===
                                "enterprise"
                              ? "bg-tertiary/10 text-tertiary border-tertiary/20"
                              : "bg-surface-container-highest text-on-surface-variant border-outline-variant/20"
                        }`}
                      >
                        {activeMei.plan ?? "Starter"}
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Danger Zone */}
          <div className="bg-surface-container rounded-xl p-6 border border-error/10">
            <h3 className="text-error font-headline font-bold mb-4">
              Zona de Perigo
            </h3>
            <div className="space-y-3">
              {activeMei && meis.length > 0 && (
                <button
                  onClick={handleDeleteMei}
                  className="w-full py-3 border border-error/30 rounded-lg text-error text-sm font-label hover:bg-error/10 transition-colors"
                >
                  Excluir MEI "{activeMei.name}"
                </button>
              )}
              <button
                onClick={handleDeleteAccount}
                className="w-full py-3 bg-error/10 border border-error/30 rounded-lg text-error text-sm font-label hover:bg-error/20 transition-colors"
              >
                Excluir Conta Permanentemente
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
