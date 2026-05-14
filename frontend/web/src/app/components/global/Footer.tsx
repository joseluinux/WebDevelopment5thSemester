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
        </div>

        {/* Links */}
        <div className="grid grid-cols-2 gap-12">
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
              Legal
            </div>
            <ul className="space-y-2 text-on-surface-variant text-sm">
              <li>
                <Link
                  className="hover:text-primary transition-colors"
                  href="/politica-de-privacidade"
                >
                  Privacidade
                </Link>
              </li>
              <li>
                <Link
                  className="hover:text-primary transition-colors"
                  href="/termos-de-uso"
                >
                  Termos
                </Link>
              </li>
              <li>
                <Link
                  className="hover:text-primary transition-colors"
                  href="/politica-de-cookies"
                >
                  Cookies
                </Link>
              </li>
            </ul>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto mt-20 pt-8 border-t border-outline-variant/10 text-center text-on-surface-variant text-xs">
        © 2026 LUMEMEI Intelligence. Todos os direitos reservados.
      </div>
    </footer>
  );
}
