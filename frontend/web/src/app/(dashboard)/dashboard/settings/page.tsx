"use client";

import { useState } from "react";
import { User, Building2, CreditCard, Shield, Check } from "lucide-react";
import { useAuthContext, useMeiContext } from "@/context";
import {
  formatCurrency,
  calcAnnualLimitPercent,
  formatCNPJ,
} from "@/utils/formatters";
import { MEI_ANNUAL_LIMIT, PLANS } from "@/utils/constants";
import { ProgressBar } from "@/app/components/ui";
import { cn } from "@/lib/cn";

const TABS = [
  { id: "profile", label: "Profile Data", icon: User },
  { id: "business", label: "Business (MEI)", icon: Building2 },
  { id: "billing", label: "Billing & Plan", icon: CreditCard },
  { id: "security", label: "Security", icon: Shield },
] as const;

type TabId = (typeof TABS)[number]["id"];

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState<TabId>("profile");

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="font-display text-display-sm font-bold text-on-surface">
          Settings
        </h1>
        <p className="text-on-muted text-sm mt-1">
          Manage your account, business profiles, and billing.
        </p>
      </div>

      {/* Tab Bar */}
      <div className="flex items-center gap-1 bg-obsidian-card rounded-xl border border-obsidian-elevated p-1 w-fit">
        {TABS.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                "flex items-center gap-2 px-4 py-2 rounded-lg text-sm transition-colors",
                isActive
                  ? "bg-accent/20 text-accent font-semibold"
                  : "text-on-muted hover:text-on-surface",
              )}
            >
              <Icon className="w-4 h-4" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Tab Content */}
      {activeTab === "profile" && <ProfileTab />}
      {activeTab === "business" && <BusinessTab />}
      {activeTab === "billing" && <BillingTab />}
      {activeTab === "security" && <SecurityTab />}
    </div>
  );
}

/* ──────────────── Profile Tab ──────────────── */
function ProfileTab() {
  const { user } = useAuthContext();
  const [form, setForm] = useState({
    name: user?.name ?? "",
    email: user?.email ?? "",
    phone: user?.phone ?? "",
  });

  return (
    <div className="grid lg:grid-cols-5 gap-6">
      <div className="lg:col-span-3 space-y-6">
        <div className="bg-obsidian-card rounded-card border border-obsidian-elevated p-6">
          <p className="text-on-surface font-semibold mb-4">Personal Profile</p>

          <div className="flex items-center gap-4 mb-6">
            <div className="w-14 h-14 rounded-full bg-accent/20 border border-accent/30 flex items-center justify-center font-bold text-accent text-xl">
              {form.name
                .split(" ")
                .map((n) => n[0])
                .slice(0, 2)
                .join("")}
            </div>
            <div>
              <p className="text-on-surface font-semibold">
                {form.name || "—"}
              </p>
              <button className="text-accent text-xs mt-1 hover:text-accent-light transition-colors">
                Change photo
              </button>
            </div>
          </div>

          <div className="space-y-4">
            <FormField
              label="Full Name"
              value={form.name}
              onChange={(v) => setForm((f) => ({ ...f, name: v }))}
              placeholder="Your full name"
            />
            <FormField
              label="Email Address"
              type="email"
              value={form.email}
              onChange={(v) => setForm((f) => ({ ...f, email: v }))}
              placeholder="your@email.com"
            />
            <FormField
              label="Phone"
              value={form.phone}
              onChange={(v) => setForm((f) => ({ ...f, phone: v }))}
              placeholder="+55 (11) 99999-9999"
            />
            <FormField label="Role" value="Owner" readOnly />
          </div>

          <button className="mt-5 px-5 py-2 rounded-lg bg-accent text-white font-semibold text-sm hover:bg-accent-muted transition-colors">
            Save Changes
          </button>
        </div>
      </div>

      <div className="lg:col-span-2 space-y-4">
        <CurrentPlanCard />
        <AnnualLimitCard />
      </div>
    </div>
  );
}

/* ──────────────── Business Tab ──────────────── */
function BusinessTab() {
  const { meis, activeMei, setActiveMei } = useMeiContext();
  const activeMeiId = activeMei?.id ?? null;

  return (
    <div className="space-y-4">
      {/* MEI Switcher */}
      <div className="bg-obsidian-card rounded-card border border-obsidian-elevated p-5">
        <p className="text-on-surface font-semibold mb-3">MEI Profiles</p>
        <div className="flex items-center gap-2 flex-wrap">
          {meis.map((mei) => (
            <button
              key={mei.id}
              onClick={() => setActiveMei(mei.id)}
              className={cn(
                "px-4 py-2 rounded-lg text-sm font-semibold transition-colors",
                mei.id === activeMeiId
                  ? "bg-accent/20 text-accent border border-accent/30"
                  : "bg-obsidian-elevated text-on-muted hover:text-on-surface",
              )}
            >
              {mei.name}
            </button>
          ))}
          <button className="px-4 py-2 rounded-lg border border-dashed border-obsidian-elevated text-on-muted text-sm hover:border-obsidian-highest hover:text-on-surface transition-colors">
            + Add MEI
          </button>
        </div>
      </div>

      {/* CNPJ / CNAE form */}
      {meis
        .filter((m) => m.id === activeMeiId)
        .map((mei) => (
          <div
            key={mei.id}
            className="bg-obsidian-card rounded-card border border-obsidian-elevated p-6"
          >
            <p className="text-on-surface font-semibold mb-4">{mei.name}</p>
            <div className="space-y-4 max-w-lg">
              <FormField
                label="Legal Name / Razão Social"
                value={mei.name}
                readOnly
              />
              <FormField
                label="CNPJ"
                value={mei.cnpj ? formatCNPJ(mei.cnpj) : ""}
                readOnly
              />
              <FormField
                label="CNAE Code"
                value={mei.cnae ?? ""}
                placeholder="Ex: 6201-5/00"
              />
              <FormField
                label="Monthly Revenue Ceiling"
                value={formatCurrency(MEI_ANNUAL_LIMIT / 12)}
                readOnly
              />
            </div>
            <button className="mt-5 px-5 py-2 rounded-lg bg-accent text-white font-semibold text-sm hover:bg-accent-muted transition-colors">
              Update Business Info
            </button>
          </div>
        ))}
    </div>
  );
}

/* ──────────────── Billing Tab ──────────────── */
function BillingTab() {
  return (
    <div className="space-y-4 max-w-2xl">
      <div className="bg-obsidian-card rounded-card border border-obsidian-elevated p-6">
        <p className="text-on-surface font-semibold mb-4">Available Plans</p>
        <div className="space-y-3">
          {Object.entries(PLANS).map(([id, plan]) => (
            <div
              key={id}
              className={cn(
                "flex items-center justify-between p-4 rounded-xl border transition-colors",
                id === "pro"
                  ? "border-accent/40 bg-accent/5"
                  : "border-obsidian-elevated",
              )}
            >
              <div>
                <div className="flex items-center gap-2">
                  <p className="text-on-surface font-semibold">{plan.label}</p>
                  {id === "pro" && (
                    <span className="text-xs font-bold bg-accent/15 text-accent border border-accent/30 px-2 py-0.5 rounded">
                      RECOMMENDED
                    </span>
                  )}
                </div>
                <p className="text-on-muted text-xs mt-0.5">
                  {plan.price === 0
                    ? "Free forever"
                    : `R$ ${plan.price.toFixed(2).replace(".", ",")}/mês`}
                </p>
                <div className="flex flex-wrap gap-2 mt-2">
                  {plan.features.slice(0, 3).map((f) => (
                    <span
                      key={f}
                      className="flex items-center gap-1 text-xs text-on-muted"
                    >
                      <Check className="w-3 h-3 text-status-success" />
                      {f}
                    </span>
                  ))}
                </div>
              </div>
              <button
                className={cn(
                  "px-4 py-2 rounded-lg text-sm font-semibold transition-colors",
                  id === "pro"
                    ? "bg-accent text-white hover:bg-accent-muted"
                    : "border border-obsidian-elevated text-on-muted hover:text-on-surface",
                )}
              >
                {id === "pro" ? "Upgrade" : "Current"}
              </button>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-obsidian-card rounded-card border border-obsidian-elevated p-6">
        <p className="text-on-surface font-semibold mb-3">Payment Method</p>
        <p className="text-on-muted text-sm">No payment method on file.</p>
        <button className="mt-3 px-4 py-2 rounded-lg border border-obsidian-elevated text-on-muted text-sm hover:text-on-surface transition-colors">
          + Add Card
        </button>
      </div>
    </div>
  );
}

/* ──────────────── Security Tab ──────────────── */
function SecurityTab() {
  return (
    <div className="space-y-4 max-w-lg">
      <div className="bg-obsidian-card rounded-card border border-obsidian-elevated p-6 space-y-4">
        <p className="text-on-surface font-semibold">Change Password</p>
        <FormField
          label="Current Password"
          type="password"
          value=""
          onChange={() => {}}
          placeholder="••••••••"
        />
        <FormField
          label="New Password"
          type="password"
          value=""
          onChange={() => {}}
          placeholder="••••••••"
        />
        <FormField
          label="Confirm New Password"
          type="password"
          value=""
          onChange={() => {}}
          placeholder="••••••••"
        />
        <button className="px-5 py-2 rounded-lg bg-accent text-white font-semibold text-sm hover:bg-accent-muted transition-colors">
          Update Password
        </button>
      </div>

      <div className="bg-obsidian-card rounded-card border border-obsidian-elevated p-6">
        <p className="text-on-surface font-semibold mb-1">
          Two-Factor Authentication
        </p>
        <p className="text-on-muted text-sm mb-3">
          Add an extra layer of security to your account.
        </p>
        <button className="px-4 py-2 rounded-lg border border-obsidian-elevated text-on-muted text-sm hover:text-on-surface transition-colors">
          Enable 2FA
        </button>
      </div>

      <div className="bg-obsidian-card rounded-card border border-status-error/30 p-6">
        <p className="text-status-error font-semibold mb-1">Danger Zone</p>
        <p className="text-on-muted text-sm mb-3">
          Delete your account permanently. This action cannot be undone.
        </p>
        <button className="px-4 py-2 rounded-lg border border-status-error/40 text-status-error text-sm hover:bg-status-error/10 transition-colors">
          Delete Account
        </button>
      </div>
    </div>
  );
}

/* ──────────────── Shared UI ──────────────── */
function FormField({
  label,
  value,
  onChange,
  placeholder,
  type = "text",
  readOnly = false,
}: {
  label: string;
  value: string;
  onChange?: (v: string) => void;
  placeholder?: string;
  type?: string;
  readOnly?: boolean;
}) {
  return (
    <div>
      <label className="block text-on-muted text-xs uppercase tracking-widest font-semibold mb-1">
        {label}
      </label>
      <input
        type={type}
        value={value}
        onChange={onChange ? (e) => onChange(e.target.value) : undefined}
        placeholder={placeholder}
        readOnly={readOnly}
        className={cn(
          "w-full px-3 py-2 bg-obsidian-elevated rounded-lg text-on-surface text-sm outline-none border border-obsidian-elevated focus:border-accent/50 transition-colors",
          readOnly && "opacity-60 cursor-not-allowed",
        )}
      />
    </div>
  );
}

function CurrentPlanCard() {
  return (
    <div className="bg-obsidian-card rounded-card border border-obsidian-elevated p-5">
      <p className="text-on-muted text-xs uppercase tracking-widest font-semibold mb-3">
        Current Plan
      </p>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-on-surface font-bold text-lg">Starter</p>
          <p className="text-on-muted text-xs">Free forever</p>
        </div>
        <span className="px-2 py-1 bg-obsidian-elevated rounded text-on-muted text-xs font-semibold">
          FREE
        </span>
      </div>
      <button className="w-full mt-4 py-2 rounded-lg bg-accent/20 border border-accent/30 text-accent font-semibold text-sm hover:bg-accent/30 transition-colors">
        Upgrade to Pro
      </button>
    </div>
  );
}

function AnnualLimitCard() {
  const revenue = 68500;
  const pct = calcAnnualLimitPercent(revenue, MEI_ANNUAL_LIMIT);
  return (
    <div className="bg-obsidian-card rounded-card border border-obsidian-elevated p-5">
      <p className="text-on-muted text-xs uppercase tracking-widest font-semibold mb-3">
        Annual Revenue Limit
      </p>
      <div className="flex items-end justify-between mb-2">
        <p className="font-display text-xl font-bold text-on-surface">
          {formatCurrency(revenue)}
        </p>
        <p className="text-on-muted text-xs">
          / {formatCurrency(MEI_ANNUAL_LIMIT)}
        </p>
      </div>
      <ProgressBar value={pct} max={100} />
      <p className="text-on-muted text-xs mt-2">
        {(100 - pct).toFixed(1)}% remaining
      </p>
    </div>
  );
}
