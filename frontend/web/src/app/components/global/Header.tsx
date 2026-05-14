"use client";

import { useState } from "react";
import Link from "next/link";

export function Header() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <header className="fixed top-0 z-50 w-full bg-[#131315]/60 backdrop-blur-2xl shadow-none">
      <div className="flex justify-between items-center w-full px-8 py-4">
        {/* Brand */}
        <div className="flex items-center gap-2">
          <Link
            href="/"
            className="text-2xl font-bold tracking-tighter text-transparent bg-clip-text bg-linear-to-br from-[#6A8CF2] to-[#B4C5FF] font-headline uppercase"
          >
            LUMEMEI
          </Link>
        </div>

        {/* Desktop Nav */}
        <nav className="hidden md:flex gap-8 items-center font-headline text-[#E5E1E4] uppercase tracking-widest text-xs">
          <Link
            className="text-[#B4C5FF] font-bold transition-colors duration-300"
            href="/"
          >
            Home
          </Link>
          <Link
            className="text-[#E5E1E4]/60 hover:text-[#B4C5FF] transition-colors duration-300"
            href="#features"
          >
            Soluções
          </Link>
          <Link
            className="text-[#E5E1E4]/60 hover:text-[#B4C5FF] transition-colors duration-300"
            href="#plans"
          >
            Planos
          </Link>
          <div className="flex gap-4 ml-4">
            <Link href="/login">
              <span className="material-symbols-outlined text-[#E5E1E4]/60 cursor-pointer active:opacity-80">
                account_circle
              </span>
            </Link>
          </div>
        </nav>

        {/* Mobile Menu Button */}
        <button
          className="md:hidden text-on-surface-variant p-1 rounded-md active:opacity-60 transition-opacity"
          onClick={() => setIsOpen((v) => !v)}
          aria-label={isOpen ? "Fechar menu" : "Abrir menu"}
        >
          <span className="material-symbols-outlined">
            {isOpen ? "close" : "menu"}
          </span>
        </button>
      </div>

      {/* Mobile dropdown */}
      {isOpen && (
        <nav className="md:hidden bg-[#131315]/95 backdrop-blur-xl px-8 py-6 flex flex-col gap-5 border-t border-white/5 font-headline uppercase tracking-widest text-xs">
          <Link
            className="text-[#B4C5FF] font-bold"
            href="/"
            onClick={() => setIsOpen(false)}
          >
            Home
          </Link>
          <Link
            className="text-[#E5E1E4]/60 hover:text-[#B4C5FF] transition-colors"
            href="#features"
            onClick={() => setIsOpen(false)}
          >
            Soluções
          </Link>
          <Link
            className="text-[#E5E1E4]/60 hover:text-[#B4C5FF] transition-colors"
            href="#plans"
            onClick={() => setIsOpen(false)}
          >
            Planos
          </Link>
          <Link
            className="text-[#E5E1E4]/60 hover:text-[#B4C5FF] transition-colors"
            href="/login"
            onClick={() => setIsOpen(false)}
          >
            Entrar
          </Link>
        </nav>
      )}
    </header>
  );
}
