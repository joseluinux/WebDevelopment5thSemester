import type { Metadata } from "next";
import { Header, Footer } from "./components/global";
import "./globals.css";

export const metadata: Metadata = {
  title: "Gestão Financeira para MEI",
  description:
    "Plataforma simples e poderosa para gerenciar as finanças do seu MEI. Registre receitas e despesas, acompanhe indicadores e receba insights de IA.",
  keywords: ["MEI", "Gestão Financeira", "Dashboard", "IA", "Brasil"],
  openGraph: {
    title: "LUME MEI - Gestão Financeira para MEI",
    description: "Controle financeiro inteligente para seu negócio.",
    url: "https://lumemei.com.br",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <body className="bg-slate-900 text-white">
        <Header />
        <main className="pt-20 min-h-screen">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
