import { AppProviders } from "@/context";
import Link from "next/link";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AppProviders>
      <div className="min-h-screen bg-obsidian-bg flex flex-col">
        <div className="flex-1 flex items-center justify-center px-4 py-12">
          {children}
        </div>
        <footer className="py-6 text-center">
          <p className="text-on-muted text-xs tracking-widest uppercase">
            LUMEMEI
          </p>
          <div className="flex justify-center gap-6 mt-3 text-on-muted text-xs">
            <Link href="#" className="hover:text-on-surface transition-colors">
              Termos
            </Link>
            <Link href="#" className="hover:text-on-surface transition-colors">
              Privacidade
            </Link>
            <Link href="#" className="hover:text-on-surface transition-colors">
              Suporte
            </Link>
          </div>
        </footer>
      </div>
    </AppProviders>
  );
}
