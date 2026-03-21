import { Button, Badge } from "../../components/ui";
import Link from "next/link";

export function Hero() {
  const highlights = [
    {
      icon: "📊",
      title: "Em tempo real",
      subtitle: "Indicadores",
    },
    {
      icon: "🔒",
      title: "Criptografia",
      subtitle: "Dados seguros",
    },
    {
      icon: "✨",
      title: "Insights",
      subtitle: "IA integrada",
    },
  ];

  return (
    <section className="min-h-screen flex flex-col items-center justify-center px-4 py-20 relative overflow-hidden">
      <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl -z-10" />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-purple-400/5 rounded-full blur-3xl -z-10" />

      <div className="max-w-7xl mx-auto w-full flex-1 flex flex-col items-center justify-center">
        <div className="max-w-4xl mx-auto text-center">
          <div className="flex justify-center mb-8">
            <Badge variant="primary" icon={<span>✨</span>}>
              Gestão financeira inteligente para MEI
            </Badge>
          </div>

          <h1 className="text-5xl sm:text-6xl md:text-7xl font-bold mb-8 leading-tight">
            Controle seu negócio
            <br />
            <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
              com clareza
            </span>
          </h1>

          <p className="text-lg sm:text-xl text-gray-400 mb-10 max-w-3xl mx-auto leading-relaxed">
            Registre receitas e despesas, acompanhe lucro e ponto de equilíbrio,
            e receba insights de IA — tudo em um só lugar, feito para o MEI
            brasileiro.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
            <Link href="/register">
              <Button
                variant="primary"
                size="lg"
                icon={<span>→</span>}
                iconPosition="right"
              >
                Começar grátis
              </Button>
            </Link>
            <Link href="/como-funciona">
              <Button variant="secondary" size="lg">
                Ver demonstração
              </Button>
            </Link>
          </div>

          <div className="w-full max-w-3xl mt-20 pt-20 border-t border-blue-500/20">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {highlights.map((highlight, index) => (
                <div key={index} className="text-center">
                  <div className="text-4xl mb-3">{highlight.icon}</div>
                  <p className="text-white font-semibold mb-1">
                    {highlight.title}
                  </p>
                  <p className="text-sm text-gray-400">{highlight.subtitle}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
