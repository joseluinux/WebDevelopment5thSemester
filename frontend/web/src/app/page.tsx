import { AppProviders } from "@/context";
import { Header, Footer } from "./components/global";
import { Hero, Features, Plans, CTA } from "./components/landing-page";

export default function Home() {
  return (
    <AppProviders>
      <Header />
      <main className="pt-20 min-h-screen">
        <Hero />
        <Features />
        <Plans />
        <CTA />
      </main>
      <Footer />
    </AppProviders>
  );
}
