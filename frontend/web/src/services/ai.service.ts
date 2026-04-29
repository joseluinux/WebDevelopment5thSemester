import type {
  AiRecommendation,
  InsightData,
  OracleRecommendation,
} from "@/types";

const delay = (ms: number) => new Promise((r) => setTimeout(r, ms));

const MOCK_RECOMMENDATIONS: OracleRecommendation[] = [
  {
    id: "rec_01",
    title: "Optimize Server Costs",
    description:
      "AWS instance under utilization detected in EU-West. Scaling down could save est. R$4.2k/mo.",
    tag: "ACTIONABLE",
    link: "#",
  },
  {
    id: "rec_02",
    title: "Subscription Churn Risk",
    description:
      "3 key enterprise accounts showing reduced engagement patterns matching historical churn models.",
    tag: "HIGH PRIORITY",
    link: "#",
  },
  {
    id: "rec_03",
    title: "New Market Opportunity",
    description:
      "Inbound interest from LATAM region increased 45% QoQ. Recommend localized pricing pilot.",
    tag: "STRATEGIC",
    link: "#",
  },
];

const MOCK_INSIGHT_DATA: InsightData = {
  projectedRevenue: 4200000,
  projectedRevenueChange: 12.4,
  costAnomalies: 3,
  costAnomaliesSeverity: "high",
  systemEfficiency: 94,
  chartData: [
    { month: "Jan", revenue: 620000, burnRate: 340000 },
    { month: "Fev", revenue: 580000, burnRate: 310000 },
    { month: "Mar", revenue: 700000, burnRate: 360000 },
    { month: "Abr", revenue: 680000, burnRate: 330000 },
    { month: "Mai", revenue: 820000, burnRate: 380000 },
  ],
  recommendations: MOCK_RECOMMENDATIONS,
};

export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  createdAt: string;
}

export const aiService = {
  async getInsights(meiId: string): Promise<InsightData> {
    await delay(600);
    // TODO: api.get(`/meis/${meiId}/insights`)
    void meiId;
    return MOCK_INSIGHT_DATA;
  },

  async getRecommendations(meiId: string): Promise<AiRecommendation[]> {
    await delay(400);
    // TODO: api.get(`/meis/${meiId}/ai-recommendations`)
    void meiId;
    return MOCK_RECOMMENDATIONS.map((r) => ({
      id: r.id,
      mei_id: meiId,
      type: r.tag,
      content: `${r.title}: ${r.description}`,
      created_at: new Date().toISOString(),
    }));
  },

  async sendMessage(meiId: string, message: string): Promise<ChatMessage> {
    await delay(1200);
    // TODO: api.post(`/meis/${meiId}/oracle/chat`, { message }) — idealmente SSE/streaming
    void meiId;

    const responses: Record<string, string> = {
      profit:
        "Com base nos lançamentos recentes, seu lucro líquido acumulado no período é de R$ 36.400, representando uma margem operacional de 53,1%. Isso está acima da média do setor para MEIs de tecnologia.",
      burn: "Sua taxa média de queima nos últimos 3 meses é de R$ 42.500/mês. Isso representa uma queda de 12% em relação ao Q3, principalmente devido à otimização dos custos de infraestrutura cloud.",
      default: `Analisei os dados do seu MEI com base na sua pergunta: "${message}". Com base nos padrões identificados, recomendo revisar as despesas da categoria Infraestrutura, que cresceram 2,1% no último mês. Deseja um detalhamento?`,
    };

    const lower = message.toLowerCase();
    const content =
      lower.includes("lucro") || lower.includes("profit")
        ? responses.profit
        : lower.includes("burn") || lower.includes("queima")
          ? responses.burn
          : responses.default;

    return {
      id: `msg_${Date.now()}`,
      role: "assistant",
      content,
      createdAt: new Date().toISOString(),
    };
  },
};
