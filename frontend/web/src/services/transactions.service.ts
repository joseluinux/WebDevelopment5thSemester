import type {
  Transaction,
  PaginatedResponse,
  TransactionFilters,
  CreateTransactionRequest,
  DashboardStats,
  ChartDataPoint,
} from "@/types";

const delay = (ms: number) => new Promise((r) => setTimeout(r, ms));

const MOCK_TRANSACTIONS: Transaction[] = [
  {
    id: "tx_01",
    mei_id: "mei_01",
    type: "income",
    category: "Revenue",
    amount: 14250.0,
    description: "Stripe Payout",
    date: "2024-10-24",
    created_at: "2024-10-24T08:15:00Z",
    import_id: "imp_01",
  },
  {
    id: "tx_02",
    mei_id: "mei_01",
    type: "expense",
    category: "Hardware",
    amount: 2499.0,
    description: "Apple Store",
    date: "2024-10-24",
    created_at: "2024-10-24T09:41:00Z",
  },
  {
    id: "tx_03",
    mei_id: "mei_01",
    type: "expense",
    category: "Infrastructure",
    amount: 845.2,
    description: "AWS Services",
    date: "2024-10-23",
    created_at: "2024-10-23T23:30:00Z",
  },
  {
    id: "tx_04",
    mei_id: "mei_01",
    type: "expense",
    category: "Travel",
    amount: 1120.0,
    description: "Delta Airlines",
    date: "2024-10-23",
    created_at: "2024-10-23T14:45:00Z",
  },
  {
    id: "tx_05",
    mei_id: "mei_01",
    type: "income",
    category: "Revenue",
    amount: 8500.0,
    description: "Consultoria Dev",
    date: "2024-10-22",
    created_at: "2024-10-22T10:00:00Z",
  },
];

export const MOCK_DASHBOARD_STATS: DashboardStats = {
  totalRevenue: 68500,
  totalExpenses: 32100,
  netProfit: 36400,
  operatingMargin: 53.1,
  revenueChange: 12.4,
  expensesChange: 2.1,
  annualLimitUsed: 68500,
  annualLimit: 81000,
};

export const MOCK_CHART_DATA: ChartDataPoint[] = [
  { month: "Jan", revenue: 9200, expenses: 5100 },
  { month: "Fev", revenue: 10800, expenses: 5400 },
  { month: "Mar", revenue: 11500, expenses: 5800 },
  { month: "Abr", revenue: 10200, expenses: 4900 },
  { month: "Mai", revenue: 13100, expenses: 5700 },
  { month: "Jun", revenue: 13700, expenses: 5200 },
];

export const transactionsService = {
  async getAll(
    meiId: string,
    filters?: TransactionFilters,
  ): Promise<PaginatedResponse<Transaction>> {
    await delay(400);
    // TODO: api.get(`/meis/${meiId}/transactions`, { params: filters })
    const filtered = MOCK_TRANSACTIONS.filter((t) => {
      if (filters?.type && filters.type !== "all")
        return t.type === filters.type;
      return true;
    });

    return {
      data: filtered,
      total: filtered.length,
      page: filters?.page ?? 1,
      limit: filters?.limit ?? 20,
    };
  },

  async create(
    meiId: string,
    data: CreateTransactionRequest,
  ): Promise<Transaction> {
    await delay(500);
    // TODO: api.post(`/meis/${meiId}/transactions`, data)
    return {
      ...data,
      id: `tx_${Date.now()}`,
      mei_id: meiId,
      created_at: new Date().toISOString(),
    };
  },

  async delete(meiId: string, transactionId: string): Promise<void> {
    await delay(300);
    // TODO: api.delete(`/meis/${meiId}/transactions/${transactionId}`)
  },

  async getDashboardStats(meiId: string): Promise<DashboardStats> {
    await delay(300);
    // TODO: api.get(`/meis/${meiId}/dashboard`)
    void meiId;
    return MOCK_DASHBOARD_STATS;
  },

  async getChartData(meiId: string): Promise<ChartDataPoint[]> {
    await delay(300);
    // TODO: api.get(`/meis/${meiId}/chart`)
    void meiId;
    return MOCK_CHART_DATA;
  },
};
