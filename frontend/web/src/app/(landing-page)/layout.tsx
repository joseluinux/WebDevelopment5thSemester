import { Header, Footer } from "@/app/components/global";
import { AppProviders } from "@/context";

export default function LandingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AppProviders>
      <Header />
      <main className="pt-20 min-h-screen">{children}</main>
      <Footer />
    </AppProviders>
  );
}
