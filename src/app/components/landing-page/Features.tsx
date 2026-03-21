import { Card } from "../../components/ui";

export function Features() {
  const features = [
    {
      icon: "📋",
      title: "Registro simplificado",
      description:
        "Cadastre receitas e despesas rapidamente. Importe planilhas ou lance manualmente.",
    },
    {
      icon: "🎯",
      title: "Categorização inteligente",
      description:
        "Custos fixos, variáveis, marketing, impostos — tudo organizado automaticamente.",
    },
    {
      icon: "📈",
      title: "Lucro e prejuízo",
      description:
        "Visualize o resultado do seu negócio por período com gráficos claros.",
    },
    {
      icon: "⚖️",
      title: "Ponto de equilíbrio",
      description:
        "Saiba exatamente quanto precisa faturar para cobrir todos os custos.",
    },
    {
      icon: "🏢",
      title: "Multi-negócio",
      description:
        "Gerencie vários MEIs em uma única conta. Ideal para contadores e empreendedores.",
    },
    {
      icon: "🤖",
      title: "Assistente de IA",
      description:
        "Pergunte sobre seus números e receba explicações simples e sugestões práticas.",
    },
  ];

  return (
    <section className="py-24 px-4 bg-slate-900/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-4xl sm:text-5xl font-bold text-center mb-4">
          Tudo que o seu MEI precisa
        </h2>
        <p className="text-center text-gray-400 mb-16 max-w-2xl mx-auto text-lg">
          Ferramentas pensadas para simplificar a gestão financeira do
          microempreendedor.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, index) => (
            <Card
              key={index}
              variant="elevated"
              padding="lg"
              className="hover:border-blue-500/60 transition-all duration-300"
            >
              <div className="text-4xl mb-4">{feature.icon}</div>
              <h3 className="text-lg font-bold text-white mb-3">
                {feature.title}
              </h3>
              <p className="text-gray-400 text-sm leading-relaxed">
                {feature.description}
              </p>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
