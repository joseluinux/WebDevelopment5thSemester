"use client";

import { useState } from "react";
import Link from "next/link";

const navItems = [
  { label: "Soluções", href: "#features" },
  { label: "Planos", href: "#plans" },
];

export function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <header className="fixed top-0 z-50 w-full bg-[#131315]/60 backdrop-blur-2xl">
      <div className="flex justify-between items-center w-full px-8 py-4">
        {/* Brand */}
        <Link
          href="/"
          className="text-2xl font-bold tracking-tighter text-transparent bg-clip-text bg-linear-to-br from-accent to-accent-light font-display"
        >
          LUMEMEI
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden md:flex gap-8 items-center font-display text-on-surface uppercase tracking-widest text-xs">
          <Link href="/" className="text-accent-light font-bold transition-colors duration-300">
            Home
          </Link>
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="text-on-surface/60 hover:text-accent-light transition-colors duration-300"
            >
              {item.label}
            </Link>
          ))}
          <div className="flex gap-3 ml-4">
            <Link
              href="/login"
              className="px-4 py-2 rounded-xl border border-obsidian-elevated text-on-muted font-semibold text-xs hover:text-on-surface hover:border-obsidian-highest transition-all"
            >
              Entrar
            </Link>
            <Link
              href="/register"
              className="px-4 py-2 rounded-xl bg-linear-to-br from-accent to-accent-light text-[#002979] font-bold text-xs hover:brightness-110 glow-primary transition-all"
            >
              Criar Conta
            </Link>
          </div>
        </nav>

        {/* Mobile menu button */}
        <button
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          className="md:hidden p-2 text-on-surface/60"
          aria-label="Menu"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            {isMenuOpen ? (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            ) : (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            )}
          </svg>
        </button>
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="md:hidden bg-[#131315]/95 backdrop-blur-xl border-t border-obsidian-elevated">
          <div className="px-8 py-4 flex flex-col gap-3">
            <Link href="/" className="py-2 text-accent-light font-semibold text-sm" onClick={() => setIsMenuOpen(false)}>Home</Link>
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="py-2 text-on-muted hover:text-accent-light text-sm transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                {item.label}
              </Link>
            ))}
            <div className="border-t border-obsidian-elevated pt-3 flex flex-col gap-2">
              <Link href="/login" className="py-2 text-on-muted text-sm" onClick={() => setIsMenuOpen(false)}>Entrar</Link>
              <Link
                href="/register"
                className="py-2 px-4 rounded-xl bg-linear-to-br from-accent to-accent-light text-[#002979] font-bold text-sm text-center"
                onClick={() => setIsMenuOpen(false)}
              >
                Criar Conta
              </Link>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
