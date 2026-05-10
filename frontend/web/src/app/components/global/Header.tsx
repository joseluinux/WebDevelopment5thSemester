import Link from "next/link";

export function Header() {
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
            <span className="material-symbols-outlined text-[#E5E1E4]/60 cursor-pointer active:opacity-80">
              notifications
            </span>
            <Link href="/login">
              <span className="material-symbols-outlined text-[#E5E1E4]/60 cursor-pointer active:opacity-80">
                account_circle
              </span>
            </Link>
          </div>
        </nav>

        {/* Mobile Menu Icon (static) */}
        <div className="md:hidden">
          <span className="material-symbols-outlined text-on-surface-variant">
            menu
          </span>
        </div>
      </div>
    </header>
  );
}
