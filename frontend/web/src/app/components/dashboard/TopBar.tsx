"use client";

import { Bell, Grid3X3, Search } from "lucide-react";

export function TopBar() {
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

        {/* MEI Name */}
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-obsidian-card border border-obsidian-elevated text-sm text-on-surface">
          <span className="w-2 h-2 rounded-full bg-status-success shrink-0" />
          <span className="font-medium">Meu MEI</span>
        </div>

        {/* Avatar */}
        <div className="w-8 h-8 rounded-full bg-accent/20 border border-accent/30 flex items-center justify-center text-accent font-bold text-xs shrink-0">
          U
        </div>
      </div>
    </header>
  );
}
