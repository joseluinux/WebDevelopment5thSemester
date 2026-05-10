// ─── Entidades do banco de dados ──────────────────────────────────────────────

export interface User {
  id: string;
  email: string;
  name: string;
  phone?: string;
  created_at: string;
}

export interface Mei {
  id: string;
  user_id: string;
  name: string;
  cnpj?: string;
  cnae?: string;
  annual_limit: number;
  plan: "starter" | "pro";
  created_at: string;
}

export type TransactionType = "income" | "expense";

export interface Transaction {
  id: string;
  mei_id: string;
  import_id?: string;
  type: TransactionType;
  category: string;
  amount: number;
  description?: string;
  date: string;
  created_at: string;
}

export type ImportStatus = "pending" | "processing" | "completed" | "failed";

export interface Import {
  id: string;
  mei_id: string;
  file_url: string;
  status: ImportStatus;
  total_rows?: number;
  processed_rows?: number;
  errors?: Record<string, unknown>;
  created_at: string;
}

export interface Product {
  id: string;
  mei_id: string;
  name: string;
  cost?: number;
  price?: number;
  desired_margin?: number;
  status: string;
  created_at: string;
}

export type ContractType = "CLT" | "PJ" | "Freelancer";

export interface Employee {
  id: string;
  mei_id: string;
  name: string;
  contract_type?: ContractType;
  salary?: number;
  charges?: number;
  created_at: string;
}

export interface AiRecommendation {
  id: string;
  mei_id: string;
  type: string;
  content: string;
  metadata?: Record<string, unknown>;
  created_at: string;
}

// ─── DTOs de resposta ──────────────────────────────────────────────────────────

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
}

export interface ApiError {
  message: string;
  code?: string;
  status: number;
}

// ─── DTOs de request ──────────────────────────────────────────────────────────

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  name: string;
  email: string;
  password: string;
  phone?: string;
}

export interface CreateTransactionRequest {
  type: TransactionType;
  category: string;
  amount: number;
  description?: string;
  date: string;
}

export interface TransactionFilters {
  period?: "7d" | "30d" | "90d" | "1y" | "custom";
  type?: TransactionType | "all";
  category?: string;
  startDate?: string;
  endDate?: string;
  page?: number;
  limit?: number;
}

export interface DashboardStats {
  totalRevenue: number;
  totalExpenses: number;
  netProfit: number;
  operatingMargin: number;
  revenueChange: number;
  expensesChange: number;
  annualLimitUsed: number;
  annualLimit: number;
}

export interface ChartDataPoint {
  month: string;
  revenue: number;
  expenses: number;
}

export interface InsightData {
  projectedRevenue: number;
  projectedRevenueChange: number;
  costAnomalies: number;
  costAnomaliesSeverity: "low" | "medium" | "high";
  systemEfficiency: number;
  chartData: { month: string; revenue: number; burnRate: number }[];
  recommendations: LumemeiRecommendation[];
}

export interface LumemeiRecommendation {
  id: string;
  title: string;
  description: string;
  tag: "ACTIONABLE" | "HIGH PRIORITY" | "STRATEGIC";
  link?: string;
}

// ─── Auth ─────────────────────────────────────────────────────────────────────

export interface AuthTokens {
  access_token: string;
  token_type: string;
}

export interface AuthSession {
  user: User;
  tokens: AuthTokens;
}
