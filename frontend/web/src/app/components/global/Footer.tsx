import Link from "next/link";

export function Footer() {
  return (
    <footer className="bg-surface-container-lowest py-20 px-8 border-t border-outline-variant/5">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-start gap-12">
        {/* Brand */}
        <div className="space-y-6">
          <Link
            href="/"
            className="text-2xl font-bold tracking-tighter text-transparent bg-clip-text bg-linear-to-br from-[#6A8CF2] to-[#B4C5FF] font-headline uppercase hover:opacity-80 transition-opacity block"
          >
            LUMEMEI
          </Link>
          <p className="text-on-surface-variant max-w-xs text-sm">
            Empoderando o microempreendedor individual com inteligência de dados
            e simplicidade radical.
          </p>
          <div className="flex gap-4">
            <div className="w-10 h-10 rounded-full bg-surface-container-highest flex items-center justify-center text-on-surface-variant hover:text-primary cursor-pointer transition-colors">
              <span className="material-symbols-outlined">public</span>
            </div>
            <div className="w-10 h-10 rounded-full bg-surface-container-highest flex items-center justify-center text-on-surface-variant hover:text-primary cursor-pointer transition-colors">
              <span className="material-symbols-outlined">language</span>
            </div>
          </div>
        </div>

        {/* Links */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-12">
          <div className="space-y-4">
            <div className="font-headline font-bold text-sm uppercase tracking-widest text-on-surface">
              Produto
            </div>
            <ul className="space-y-2 text-on-surface-variant text-sm">
              <li>
                <Link
                  className="hover:text-primary transition-colors"
                  href="/#features"
                >
                  Funcionalidades
                </Link>
              </li>
              <li>
                <Link
                  className="hover:text-primary transition-colors"
                  href="/#plans"
                >
                  Planos
                </Link>
              </li>
              <li>
                <Link
                  className="hover:text-primary transition-colors"
                  href="/register"
                >
                  Segurança
                </Link>
              </li>
            </ul>
          </div>
          <div className="space-y-4">
            <div className="font-headline font-bold text-sm uppercase tracking-widest text-on-surface">
              Recursos
            </div>
            <ul className="space-y-2 text-on-surface-variant text-sm">
              <li>
                <Link
                  className="hover:text-primary transition-colors"
                  href="/#features"
                >
                  Blog
                </Link>
              </li>
              <li>
                <Link
                  className="hover:text-primary transition-colors"
                  href="/#features"
                >
                  Guia MEI
                </Link>
              </li>
              <li>
                <Link
                  className="hover:text-primary transition-colors"
                  href="/login"
                >
                  Suporte
                </Link>
              </li>
            </ul>
          </div>
          <div className="space-y-4">
            <div className="font-headline font-bold text-sm uppercase tracking-widest text-on-surface">
              Legal
            </div>
            <ul className="space-y-2 text-on-surface-variant text-sm">
              <li>
                <Link className="hover:text-primary transition-colors" href="/">
                  Privacidade
                </Link>
              </li>
              <li>
                <Link className="hover:text-primary transition-colors" href="/">
                  Termos
                </Link>
              </li>
              <li>
                <Link className="hover:text-primary transition-colors" href="/">
                  Cookies
                </Link>
              </li>
            </ul>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto mt-20 pt-8 border-t border-outline-variant/10 text-center text-on-surface-variant text-xs">
        © 2024 LUMEMEI Intelligence. Todos os direitos reservados.
      </div>
    </footer>
  );
}
