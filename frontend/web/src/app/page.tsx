import { Header, Footer } from "./components/global";
import { Hero, Features, Plans, CTA } from "./components/landing-page";

export default function Home() {
  return (
    <>
      <Header />
      <main className="relative pt-24 overflow-hidden">
        <Hero />
        <Features />
        <Plans />
        <CTA />
      </main>
      <Footer />
    </>
  );
}
