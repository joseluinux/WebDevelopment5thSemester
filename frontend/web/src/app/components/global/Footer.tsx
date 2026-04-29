export function Footer() {
  return (
    <footer className="bg-surface-container-lowest py-20 px-8 border-t border-outline-variant/5">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-start gap-12">
        {/* Brand */}
        <div className="space-y-6">
          <div className="text-2xl font-bold tracking-tighter text-transparent bg-clip-text bg-linear-to-br from-[#6A8CF2] to-[#B4C5FF] font-headline uppercase">
            LUMEMEI
          </div>
          <p className="text-on-surface-variant max-w-xs text-sm">
            Empoderando o microempreendedor individual com inteligência de dados e simplicidade radical.
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
            <div className="font-headline font-bold text-sm uppercase tracking-widest text-on-surface">Produto</div>
            <ul className="space-y-2 text-on-surface-variant text-sm">
              <li><a className="hover:text-primary transition-colors" href="#">Funcionalidades</a></li>
              <li><a className="hover:text-primary transition-colors" href="#">Planos</a></li>
              <li><a className="hover:text-primary transition-colors" href="#">Segurança</a></li>
            </ul>
          </div>
          <div className="space-y-4">
            <div className="font-headline font-bold text-sm uppercase tracking-widest text-on-surface">Recursos</div>
            <ul className="space-y-2 text-on-surface-variant text-sm">
              <li><a className="hover:text-primary transition-colors" href="#">Blog</a></li>
              <li><a className="hover:text-primary transition-colors" href="#">Guia MEI</a></li>
              <li><a className="hover:text-primary transition-colors" href="#">Suporte</a></li>
            </ul>
          </div>
          <div className="space-y-4">
            <div className="font-headline font-bold text-sm uppercase tracking-widest text-on-surface">Legal</div>
            <ul className="space-y-2 text-on-surface-variant text-sm">
              <li><a className="hover:text-primary transition-colors" href="#">Privacidade</a></li>
              <li><a className="hover:text-primary transition-colors" href="#">Termos</a></li>
              <li><a className="hover:text-primary transition-colors" href="#">Cookies</a></li>
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