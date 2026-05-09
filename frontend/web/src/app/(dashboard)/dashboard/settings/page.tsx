import type { Metadata } from "next";

export const metadata: Metadata = { title: "Settings — LUMEMEI" };

export default function SettingsPage() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="font-display text-display-sm font-bold text-on-surface">
            Settings
          </h1>
          <p className="text-on-surface-variant text-sm mt-1">
            Manage your organizational profile, business credentials, and
            subscription details.
          </p>
        </div>
        {/* Context Switcher */}
        <div className="hidden md:flex items-center gap-2 bg-surface-container rounded-xl border border-outline-variant/10 p-1">
          <button className="px-4 py-2 rounded-lg bg-primary-container/10 text-primary font-semibold text-xs flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-primary" />
            TechNova Solutions
          </button>
          <button className="px-4 py-2 rounded-lg text-on-surface-variant hover:bg-surface-container-high text-xs transition-colors">
            Studio Arc
          </button>
          <button className="px-4 py-2 rounded-lg text-on-surface-variant hover:bg-surface-container-high text-xs transition-colors">
            +
          </button>
        </div>
      </div>

      <div className="grid lg:grid-cols-12 gap-6">
        {/* Sidebar Tabs */}
        <div className="lg:col-span-3">
          <nav className="space-y-0.5">
            {[
              { label: "Profile Data", icon: "person", active: true },
              { label: "Business (MEI)", icon: "business", active: false },
              { label: "Billing & Plan", icon: "credit_card", active: false },
              { label: "Security", icon: "shield", active: false },
            ].map((item) => (
              <button
                key={item.label}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm text-left transition-colors ${
                  item.active
                    ? "bg-primary-container/10 text-primary font-semibold"
                    : "text-on-surface-variant hover:bg-surface-container hover:text-on-surface"
                }`}
              >
                <span className="material-symbols-outlined text-base">
                  {item.icon}
                </span>
                {item.label}
              </button>
            ))}
          </nav>
        </div>

        {/* Profile Content */}
        <div className="lg:col-span-9 space-y-6">
          {/* Personal Profile */}
          <div className="bg-surface-container rounded-xl p-6">
            <div className="flex items-center justify-between mb-6">
              <p className="text-on-surface font-headline font-bold text-lg">
                Personal Profile
              </p>
              <button className="flex items-center gap-1 text-primary text-xs font-semibold hover:text-primary-container transition-colors">
                Edit
                <span className="material-symbols-outlined text-base">
                  edit
                </span>
              </button>
            </div>

            <div className="flex items-start gap-6 mb-6">
              <div className="w-16 h-16 rounded-full bg-primary-container/10 border border-primary-container/20 flex items-center justify-center font-headline font-bold text-primary text-xl shrink-0">
                JD
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 flex-1">
                <div>
                  <p className="text-on-surface-variant text-[10px] uppercase tracking-widest font-semibold mb-1">
                    Full Name
                  </p>
                  <div className="bg-surface-container-high rounded-lg px-4 py-3 text-on-surface text-sm">
                    Jordan Doe
                  </div>
                </div>
                <div>
                  <p className="text-on-surface-variant text-[10px] uppercase tracking-widest font-semibold mb-1">
                    Email Address
                  </p>
                  <div className="bg-surface-container-high rounded-lg px-4 py-3 text-on-surface text-sm">
                    jordan@technova.com
                  </div>
                </div>
                <div>
                  <p className="text-on-surface-variant text-[10px] uppercase tracking-widest font-semibold mb-1">
                    Phone
                  </p>
                  <div className="bg-surface-container-high rounded-lg px-4 py-3 text-on-surface text-sm">
                    +55 (11) 98765-4321
                  </div>
                </div>
                <div>
                  <p className="text-on-surface-variant text-[10px] uppercase tracking-widest font-semibold mb-1">
                    Role
                  </p>
                  <div className="bg-surface-container-high rounded-lg px-4 py-3 text-on-surface text-sm">
                    Administrator
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Current Plan */}
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="bg-surface-container rounded-xl p-6">
              <p className="text-on-surface-variant text-[10px] uppercase tracking-widest font-semibold mb-3">
                Current Plan
              </p>
              <p className="font-headline font-bold text-2xl text-on-surface mb-1">
                Pro Edition
              </p>
              <p className="text-on-surface-variant text-xs mb-4">
                Billed annually. Next cycle starts Oct 12, 2024.
              </p>
              <div className="flex gap-2">
                <button className="px-4 py-2 bg-surface-container-high rounded-lg text-on-surface text-sm font-semibold hover:bg-surface-container-highest transition-colors">
                  Manage
                </button>
                <button className="px-4 py-2 rounded-lg text-primary text-sm font-semibold hover:bg-primary/10 transition-colors">
                  Upgrade
                </button>
              </div>
            </div>

            <div className="bg-surface-container rounded-xl p-6">
              <p className="text-on-surface-variant text-[10px] uppercase tracking-widest font-semibold mb-3">
                Annual Revenue Limit
              </p>
              <p className="font-headline font-bold text-2xl text-on-surface mb-1">
                R$ 62.450,<span className="text-base">00</span>
              </p>
              <p className="text-on-surface-variant text-xs mb-3">
                out of R$ 81.000,00 limit
              </p>
              <div className="h-2 w-full bg-surface-container-high rounded-full overflow-hidden mb-1">
                <div
                  className="h-full prism-gradient rounded-full"
                  style={{ width: "77%" }}
                />
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-on-surface-variant">77% Consumed</span>
                <span className="text-primary font-semibold">Safe Zone</span>
              </div>
            </div>
          </div>

          {/* Business Details */}
          <div className="bg-surface-container rounded-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <p className="text-on-surface font-headline font-bold">
                  Business Details (MEI)
                </p>
                <span className="text-[10px] font-bold bg-surface-container-high text-on-surface-variant px-2 py-0.5 rounded uppercase tracking-widest">
                  Hidden
                </span>
              </div>
              <span className="material-symbols-outlined text-on-surface-variant cursor-pointer">
                chevron_right
              </span>
            </div>
            <p className="text-on-surface-variant text-sm">
              CNPJ, CNAE, Address
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
