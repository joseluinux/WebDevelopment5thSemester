"use client";

import { Bell, Grid3X3, Search, ChevronDown } from "lucide-react";
import { useMeiContext } from "@/context";
import { useAuthContext } from "@/context";

export function TopBar() {
  const { meis, activeMei, setActiveMei } = useMeiContext();
  const { user } = useAuthContext();

  const initials = user?.name
    ? user.name
        .split(" ")
        .map((n) => n[0])
        .slice(0, 2)
        .join("")
    : "?";

  return (
    <header className="fixed top-0 left-48 right-0 h-14 z-30 flex items-center px-6 gap-4 bg-obsidian-surface/60 backdrop-blur-glass border-b border-obsidian-elevated">
      {/* Search */}
      <div className="flex-1 max-w-xs">
        <div className="flex items-center gap-2 bg-obsidian-card rounded-lg px-3 py-2 border border-obsidian-elevated">
          <Search className="w-3.5 h-3.5 text-on-muted shrink-0" />
          <input
            type="text"
            placeholder="Search transactions..."
            className="bg-transparent text-sm text-on-muted placeholder-on-muted/60 outline-none w-full"
          />
        </div>
      </div>

      <div className="flex-1" />

      {/* Actions */}
      <div className="flex items-center gap-3">
        <button className="relative p-2 rounded-lg hover:bg-obsidian-card transition-colors text-on-muted hover:text-on-surface">
          <Bell className="w-4 h-4" />
        </button>

        <button className="p-2 rounded-lg hover:bg-obsidian-card transition-colors text-on-muted hover:text-on-surface">
          <Grid3X3 className="w-4 h-4" />
        </button>

        {/* Context Switcher (multi-MEI) */}
        <div className="relative group">
          <button className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-obsidian-card border border-obsidian-elevated hover:border-accent/40 transition-colors text-sm text-on-surface">
            <span className="w-2 h-2 rounded-full bg-status-success shrink-0" />
            <span className="font-medium max-w-[120px] truncate">
              {activeMei?.name ?? "Selecionar MEI"}
            </span>
            <ChevronDown className="w-3.5 h-3.5 text-on-muted" />
          </button>

          {/* Dropdown */}
          {meis.length > 1 && (
            <div className="absolute right-0 top-full mt-1 w-48 bg-obsidian-popover rounded-xl border border-obsidian-elevated shadow-obsidian opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50">
              {meis.map((mei) => (
                <button
                  key={mei.id}
                  onClick={() => setActiveMei(mei.id)}
                  className="flex items-center gap-2 w-full px-4 py-3 text-sm text-on-surface hover:bg-obsidian-elevated transition-colors first:rounded-t-xl last:rounded-b-xl"
                >
                  <span
                    className={`w-2 h-2 rounded-full shrink-0 ${
                      mei.id === activeMei?.id
                        ? "bg-accent"
                        : "bg-obsidian-highest"
                    }`}
                  />
                  {mei.name}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Avatar */}
        <div className="w-8 h-8 rounded-full bg-accent/20 border border-accent/30 flex items-center justify-center text-accent font-bold text-xs shrink-0">
          {initials}
        </div>
      </div>
    </header>
  );
}
