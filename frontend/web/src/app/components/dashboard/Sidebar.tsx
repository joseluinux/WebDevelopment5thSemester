"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useMeiContext } from "@/contexts/MeiContext";
import { useAuth } from "@/hooks/useAuth";

const NAV_ITEMS = [
  { label: "Dashboard", href: "/dashboard", icon: "dashboard" },
  {
    label: "Transactions",
    href: "/dashboard/transactions",
    icon: "account_balance_wallet",
  },
  { label: "Import", href: "/dashboard/import", icon: "cloud_upload" },
  { label: "Products", href: "/dashboard/products", icon: "inventory_2" },
  { label: "Employees", href: "/dashboard/employees", icon: "badge" },
  { label: "LUMEMEI AI", href: "/dashboard/oracle-ai", icon: "psychology" },
  { label: "Insights", href: "/dashboard/insights", icon: "insights" },
  { label: "Settings", href: "/dashboard/settings", icon: "settings" },
];

export function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { meis, activeMei, setActiveMei } = useMeiContext();
  const { logout } = useAuth();

  const isActive = (href: string) => {
    if (href === "/dashboard") return pathname === "/dashboard";
    return pathname.startsWith(href);
  };

  async function handleLogout() {
    await logout();
    router.push("/login");
  }

  return (
    <nav className="bg-[#141315] hidden md:flex flex-col h-full py-8 w-64 fixed left-0 top-0 z-50">
      {/* Logo */}
      <div className="px-6 mb-8 flex flex-col items-start gap-1">
        <Link
          href="/dashboard"
          className="text-2xl font-black text-white font-headline tracking-tighter uppercase hover:opacity-80 transition-opacity"
        >
          LUMEMEI
        </Link>
        <span className="text-[10px] text-on-surface-variant font-label tracking-widest uppercase">
          Fintech Obsidian
        </span>
      </div>

      {/* MEI Switcher */}
      {meis.length > 0 && (
        <div className="px-4 mb-6">
          <p className="text-[10px] uppercase tracking-widest text-on-surface-variant mb-2 px-2">
            MEI Ativo
          </p>
          <select
            value={activeMei?.id ?? ""}
            onChange={(e) => setActiveMei(e.target.value)}
            className="w-full bg-surface-container-lowest text-on-surface text-xs rounded-lg px-3 py-2 border border-outline-variant/20 focus:outline-none focus:ring-1 focus:ring-primary/40"
          >
            {meis.map((mei) => (
              <option key={mei.id} value={mei.id}>
                {mei.name}
              </option>
            ))}
          </select>
          <Link
            href="/onboarding"
            className="flex items-center gap-1 mt-2 px-2 text-[10px] text-on-surface-variant hover:text-primary transition-colors"
          >
            <span className="material-symbols-outlined text-sm">add</span>
            Novo MEI
          </Link>
        </div>
      )}

      {/* CTA */}
      <div className="px-6 mb-8">
        <Link
          href="/dashboard/transactions?new=true"
          className="w-full bg-linear-to-r from-primary to-primary-container text-white py-3 px-4 rounded-lg font-label font-medium text-sm flex items-center justify-center gap-2 hover:shadow-[0_0_20px_rgba(106,140,242,0.2)] transition-all duration-300"
        >
          <span
            className="material-symbols-outlined text-lg"
            style={{ fontVariationSettings: "'FILL' 1" }}
          >
            add
          </span>
          New Transaction
        </Link>
      </div>

      {/* Navigation */}
      <div className="flex-1 overflow-y-auto overflow-x-hidden flex flex-col gap-1 w-full">
        {NAV_ITEMS.map(({ label, href, icon }) => (
          <Link
            key={href}
            href={href}
            className={
              isActive(href)
                ? "bg-[#201F21] text-[#6A8CF2] border-r-2 border-[#6A8CF2] py-3 px-6 flex items-center gap-3 font-label uppercase tracking-widest text-[10px] transition-all duration-300 group"
                : "text-[#C4C6D5] py-3 px-6 flex items-center gap-3 hover:bg-[#1C1B1D] font-label uppercase tracking-widest text-[10px] hover:text-white transition-all duration-300 group"
            }
          >
            <span
              className="material-symbols-outlined group-hover:translate-x-1 transition-transform"
              style={
                isActive(href)
                  ? { fontVariationSettings: "'FILL' 1" }
                  : undefined
              }
            >
              {icon}
            </span>
            <span>{label}</span>
          </Link>
        ))}
      </div>

      {/* Footer */}
      <div className="mt-auto w-full">
        <button
          onClick={handleLogout}
          className="w-full text-left text-[#C4C6D5] py-3 px-6 flex items-center gap-3 hover:bg-[#201F21] font-label uppercase tracking-widest text-[10px] hover:text-white transition-all duration-300 group"
        >
          <span className="material-symbols-outlined group-hover:translate-x-1 transition-transform">
            logout
          </span>
          <span>Sign Out</span>
        </button>
      </div>
    </nav>
  );
}
