import type { Metadata } from "next";
import { Space_Grotesk, Inter } from "next/font/google";
import "./globals.css";

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-space-grotesk",
  display: "swap",
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  title: "LUMEMEI — Gestão Financeira para MEI",
  description:
    "Plataforma de inteligência financeira para Microempreendedores Individuais. Registre receitas e despesas, acompanhe indicadores e receba insights de IA.",
  keywords: [
    "MEI",
    "Gestão Financeira",
    "Dashboard",
    "IA",
    "Brasil",
    "LUMEMEI",
  ],
  openGraph: {
    title: "LUMEMEI — Gestão Financeira para MEI",
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
    <html
      lang="pt-BR"
      suppressHydrationWarning
      className={`${spaceGrotesk.variable} ${inter.variable}`}
    >
      <body className="bg-obsidian-bg text-on-surface antialiased">
        {/* Fixed ambient glows — aparecem em todas as páginas */}
        <div className="page-glow-tr" aria-hidden="true" />
        <div className="page-glow-bl" aria-hidden="true" />
        {children}
      </body>
    </html>
  );
}
