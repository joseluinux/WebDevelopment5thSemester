"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  CreditCard,
  Upload,
  Package,
  Users,
  Brain,
  TrendingUp,
  Settings,
  HelpCircle,
  LogOut,
  Plus,
} from "lucide-react";
import { cn } from "@/lib/cn";
import { useAuth } from "@/hooks/useAuth";

const NAV_ITEMS = [
  { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { label: "Transactions", href: "/dashboard/transactions", icon: CreditCard },
  { label: "Import", href: "/dashboard/import", icon: Upload },
  { label: "Products", href: "/dashboard/products", icon: Package },
  { label: "Employees", href: "/dashboard/employees", icon: Users },
  { label: "Oracle AI", href: "/dashboard/oracle-ai", icon: Brain },
  { label: "Insights", href: "/dashboard/insights", icon: TrendingUp },
  { label: "Settings", href: "/dashboard/settings", icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname();
  const { logout } = useAuth();

  const isActive = (href: string) => {
    if (href === "/dashboard") return pathname === "/dashboard";
    return pathname.startsWith(href);
  };

  return (
    <aside className="fixed left-0 top-0 h-full w-48 bg-obsidian-surface flex flex-col z-40">
      {/* Logo */}
      <div className="px-5 pt-6 pb-4">
        <p className="text-on-surface font-display font-bold text-lg tracking-tight">
          LUMEMEI
        </p>
        <p className="text-on-muted text-xs mt-0.5">Fintech Obsidian</p>
      </div>

      {/* New Transaction CTA */}
      <div className="px-4 mb-4">
        <Link
          href="/dashboard/transactions?new=true"
          className="flex items-center gap-2 w-full px-3 py-2.5 rounded-lg bg-accent/20 hover:bg-accent/30 text-accent font-semibold text-sm transition-colors border border-accent/30"
        >
          <Plus className="w-4 h-4" />
          New Transaction
        </Link>
      </div>

      {/* Nav items */}
      <nav className="flex-1 px-3 space-y-0.5">
        {NAV_ITEMS.map(({ label, href, icon: Icon }) => (
          <Link
            key={href}
            href={href}
            className={cn(
              "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors group",
              isActive(href)
                ? "bg-accent/15 text-accent font-semibold border-l-2 border-accent pl-[10px]"
                : "text-on-muted hover:text-on-surface hover:bg-obsidian-card",
            )}
          >
            <Icon
              className={cn(
                "w-4 h-4 shrink-0",
                isActive(href)
                  ? "text-accent"
                  : "text-on-muted group-hover:text-on-surface",
              )}
            />
            <span className="uppercase tracking-wider text-xs font-semibold">
              {label}
            </span>
          </Link>
        ))}
      </nav>

      {/* Bottom actions */}
      <div className="px-3 pb-6 space-y-0.5 border-t border-obsidian-elevated mt-4 pt-4">
        <Link
          href="#"
          className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-on-muted hover:text-on-surface hover:bg-obsidian-card text-sm transition-colors"
        >
          <HelpCircle className="w-4 h-4" />
          <span className="uppercase tracking-wider text-xs font-semibold">
            Support
          </span>
        </Link>
        <button
          onClick={logout}
          className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-on-muted hover:text-status-error hover:bg-status-error/10 text-sm transition-colors w-full"
        >
          <LogOut className="w-4 h-4" />
          <span className="uppercase tracking-wider text-xs font-semibold">
            Sign Out
          </span>
        </button>
      </div>
    </aside>
  );
}
