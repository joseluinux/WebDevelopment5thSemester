"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Button, Logo } from "../../components/ui";

interface NavItem {
  label: string;
  href: string;
}

const navItems: NavItem[] = [
  { label: "Como Funciona", href: "/como-funciona" },
  { label: "Preços", href: "/precos" },
  { label: "Sobre", href: "/sobre" },
];

export function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 0);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768) setIsMenuOpen(false);
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <header
      className={`fixed w-full top-0 z-50 transition-all duration-300 ${
        isScrolled
          ? "bg-slate-900/90 backdrop-blur-md border-b border-blue-500/20"
          : "bg-transparent"
      }`}
    >
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
        <Logo href="/" showText={true} size="md" />

        <div className="hidden md:flex items-center gap-8">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="relative text-gray-300 transition-colors duration-300 hover:text-blue-400 after:content-[''] after:absolute after:bottom-0 after:left-0 after:w-0 after:h-0.5 after:bg-gradient-to-r after:from-blue-500 after:to-purple-600 after:transition-all after:duration-300 hover:after:w-full"
            >
              {item.label}
            </Link>
          ))}
        </div>

        <div className="flex items-center gap-3 sm:gap-4">
          <Link href="/login" className="hidden sm:block">
            <Button variant="ghost" size="md">
              Entrar
            </Button>
          </Link>

          <Link href="/register">
            <Button variant="primary" size="md">
              <span className="hidden sm:inline">Criar Conta</span>
              <span className="sm:hidden">Começar</span>
            </Button>
          </Link>

          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="md:hidden p-2 hover:bg-blue-500/10 rounded-lg transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-blue-400"
            aria-label={isMenuOpen ? "Fechar menu" : "Abrir menu"}
            aria-expanded={isMenuOpen}
          >
            <svg
              className="w-6 h-6 text-blue-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              {isMenuOpen ? (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              ) : (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 12h16M4 18h16"
                />
              )}
            </svg>
          </button>
        </div>

        {isMenuOpen && (
          <div className="absolute top-full left-0 right-0 md:hidden bg-slate-900/95 border-b border-blue-500/20 backdrop-blur-md">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex flex-col gap-3">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="px-4 py-3 text-blue-400 hover:bg-blue-500/10 rounded-lg transition-colors"
                  onClick={() => setIsMenuOpen(false)}
                >
                  {item.label}
                </Link>
              ))}

              <div className="border-t border-blue-500/20 my-2" />

              <Link
                href="/login"
                className="px-4 py-3 text-gray-300 hover:text-blue-400 hover:bg-blue-500/10 rounded-lg transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                Entrar
              </Link>
            </div>
          </div>
        )}
      </nav>
    </header>
  );
}
