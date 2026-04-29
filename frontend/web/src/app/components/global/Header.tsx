"use client";

import { useState } from "react";
import Link from "next/link";

export function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <header className="fixed top-0 z-50 w-full bg-[#131315]/60 backdrop-blur-2xl shadow-none">
      <div className="flex justify-between items-center w-full px-8 py-4">
        {/* Brand */}
        <div className="flex items-center gap-2">
          <Link
            href="/"
            className="text-2xl font-bold tracking-tighter text-transparent bg-clip-text bg-linear-to-br from-[#6A8CF2] to-[#B4C5FF] font-headline"
          >
            LUMEMEI
          </Link>
        </div>

        {/* Desktop Nav */}
        <nav className="hidden md:flex gap-8 items-center font-headline text-[#E5E1E4] uppercase tracking-widest text-xs">
          <Link className="text-[#B4C5FF] font-bold transition-colors duration-300" href="/">Home</Link>
          <Link className="text-[#E5E1E4]/60 hover:text-[#B4C5FF] transition-colors duration-300" href="#features">Soluções</Link>
          <Link className="text-[#E5E1E4]/60 hover:text-[#B4C5FF] transition-colors duration-300" href="#plans">Planos</Link>
          <div className="flex gap-4 ml-4">
            <span className="material-symbols-outlined text-[#E5E1E4]/60 cursor-pointer active:opacity-80">notifications</span>
            <Link href="/login">
              <span className="material-symbols-outlined text-[#E5E1E4]/60 cursor-pointer active:opacity-80">account_circle</span>
            </Link>
          </div>
        </nav>

        {/* Mobile menu button */}
        <button
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          className="md:hidden"
          aria-label="Menu"
        >
          <span className="material-symbols-outlined">{isMenuOpen ? "close" : "menu"}</span>
        </button>
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="md:hidden bg-[#131315]/95 backdrop-blur-xl px-8 py-4 flex flex-col gap-4 border-t border-outline-variant/10">
          <Link href="/" className="text-primary text-sm font-semibold" onClick={() => setIsMenuOpen(false)}>Home</Link>
          <Link href="#features" className="text-on-surface-variant text-sm" onClick={() => setIsMenuOpen(false)}>Soluções</Link>
          <Link href="#plans" className="text-on-surface-variant text-sm" onClick={() => setIsMenuOpen(false)}>Planos</Link>
          <Link href="/login" className="text-on-surface-variant text-sm" onClick={() => setIsMenuOpen(false)}>Entrar</Link>
          <Link href="/register" className="text-sm font-bold text-center py-2 px-4 rounded-xl bg-linear-to-br from-primary-container to-primary text-on-primary" onClick={() => setIsMenuOpen(false)}>Criar Conta</Link>
        </div>
      )}
    </header>
  );
}
