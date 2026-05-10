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
      <head>
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200"
        />
      </head>
      <body className="bg-background text-on-surface font-body antialiased selection:bg-primary/30 selection:text-primary">
        {/* Fixed ambient glows — aparecem em todas as páginas */}
        <div className="page-glow-tr" aria-hidden="true" />
        <div className="page-glow-bl" aria-hidden="true" />
        {children}
      </body>
    </html>
  );
}
