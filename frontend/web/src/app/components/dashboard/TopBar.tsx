"use client";

import Link from "next/link";
import { useAuth } from "@/hooks/useAuth";
import { useRouter } from "next/navigation";

export function TopBar({ onMenuClick }: { onMenuClick?: () => void }) {
  const { user, logout } = useAuth();
  const router = useRouter();

  async function handleLogout() {
    await logout();
    router.push("/login");
  }

  const initials = user?.name
    ? user.name
        .split(" ")
        .slice(0, 2)
        .map((n) => n[0])
        .join("")
        .toUpperCase()
    : (user?.email?.[0]?.toUpperCase() ?? "U");

  return (
    <header className="bg-[#1C1B1D]/80 backdrop-blur-xl sticky top-0 z-40 shadow-2xl shadow-black/40 flex justify-between items-center w-full px-6 py-3 border-none shadow-[0px_1px_0px_0px_rgba(255,255,255,0.05)]">
      <div className="flex items-center gap-4">
        {/* Hamburger - mobile only */}
        <button
          className="md:hidden text-[#C4C6D5] p-2 rounded-full hover:bg-[#2B292C] transition-colors"
          onClick={onMenuClick}
          aria-label="Abrir menu"
        >
          <span className="material-symbols-outlined">menu</span>
        </button>
        {/* Mobile brand */}
        <div className="md:hidden text-xl font-bold text-white tracking-tighter font-headline">
          LUMEMEI
        </div>
        {/* Search */}
        <div className="hidden sm:flex items-center bg-surface-container-lowest rounded-full px-4 py-2 border border-outline-variant/15 w-64 focus-within:border-primary/30 transition-colors">
          <span className="material-symbols-outlined text-on-surface-variant text-sm mr-2">
            search
          </span>
          <input
            className="bg-transparent border-none text-sm font-body text-on-surface focus:ring-0 w-full placeholder-on-surface-variant p-0 outline-none"
            placeholder="Search transactions..."
            type="text"
          />
        </div>
      </div>

      <div className="flex items-center gap-2">
        <button className="text-[#C4C6D5] active:opacity-80 transition-all hover:bg-[#2B292C] transition-colors duration-200 p-2 rounded-full flex items-center justify-center">
          <span className="material-symbols-outlined">notifications</span>
        </button>
        <button className="text-[#C4C6D5] active:opacity-80 transition-all hover:bg-[#2B292C] transition-colors duration-200 p-2 rounded-full flex items-center justify-center">
          <span className="material-symbols-outlined">apps</span>
        </button>
        <div className="w-px h-6 bg-outline-variant/30 mx-2" />
        {/* User menu */}
        <div className="relative group">
          <Link
            href="/dashboard/settings"
            className="flex items-center gap-2 pl-2 rounded-full hover:bg-surface-container-high transition-colors p-1"
          >
            <div className="w-8 h-8 rounded-full bg-primary-container/20 border border-primary-container/30 flex items-center justify-center text-primary-container font-bold text-xs">
              {initials}
            </div>
            {user?.name && (
              <span className="hidden lg:block text-sm text-on-surface-variant pr-2 max-w-32 truncate">
                {user.name}
              </span>
            )}
          </Link>
          {/* Logout button */}
          <button
            onClick={handleLogout}
            className="hidden group-hover:flex absolute right-0 top-full mt-1 items-center gap-2 px-3 py-2 bg-surface-container border border-outline-variant/20 rounded-lg text-sm text-on-surface-variant hover:text-error transition-colors whitespace-nowrap z-50 shadow-xl"
          >
            <span className="material-symbols-outlined text-base">logout</span>
            Sair
          </button>
        </div>
      </div>
    </header>
  );
}
