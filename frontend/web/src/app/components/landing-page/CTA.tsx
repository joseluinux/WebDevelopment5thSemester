import { Button } from "../../components/ui";
import Link from "next/link";

export function CTA() {
  return (
    <section className="py-24 px-4 border-t border-blue-500/20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="text-5xl sm:text-6xl font-bold mb-6">
            Pronto para ter
            <br />
            <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
              controle total?
            </span>
          </h2>
          <p className="text-lg text-gray-400 mb-10 max-w-xl mx-auto">
            Comece agora a entender a saúde financeira do seu negócio.
            <br />
            Sem complicação.
          </p>
          <Link href="/register">
            <Button
              variant="primary"
              size="lg"
              icon={<span>→</span>}
              iconPosition="right"
            >
              Criar conta grátis
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
}
