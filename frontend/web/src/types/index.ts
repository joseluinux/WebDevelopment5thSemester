// ─── API Response Types (camelCase — ASP.NET Core serialization default) ──────

/** POST /v1/auth/login → LoginResponse */
export interface LoginResponse {
  accessToken: string;
  refreshToken: string;
  expiresAt: string; // ISO 8601 UTC
}

/** GET /v1/auth/me  |  GET /v1/users/me  |  PUT /v1/users/me */
export interface UserProfile {
  id: string;
  name: string | null;
  email: string;
  createdAt: string;
}

/** GET /v1/meis  |  POST /v1/meis  |  GET /v1/meis/:id  |  PUT /v1/meis/:id */
export interface MeiResult {
  id: string;
  name: string;
  cnpj: string | null;
  cnae: string | null;
  annualLimit: number | null;
  plan: string | null;
  createdAt: string;
  updatedAt: string | null;
}

/** GET /v1/meis/:id/transactions  |  POST  |  GET /:txId  |  PUT /:txId */
export interface TransactionResult {
  id: string;
  meiId: string;
  type: "income" | "expense";
  category: string | null;
  amount: number;
  /** DateOnly — serialized as "YYYY-MM-DD" */
  date: string;
  description: string | null;
  createdAt: string;
  updatedAt: string | null;
}

/** GET /v1/meis/:id/products  |  POST  |  GET /:prodId  |  PUT /:prodId */
export interface ProductResult {
  id: string;
  meiId: string;
  name: string;
  cost: number | null;
  price: number | null;
  desiredMargin: number | null;
  status: string | null;
  createdAt: string;
  updatedAt: string | null;
  /** Calculated server-side: (Price - Cost) / Price * 100 */
  margin: number;
  isMarginBelowDesired: boolean;
}

/** GET /v1/meis/:id/employees  |  POST */
export interface EmployeeResult {
  id: string;
  meiId: string;
  name: string;
  contractType: string | null;
  salary: number | null;
  charges: number | null;
  createdAt: string;
  updatedAt: string | null;
  /** Calculated server-side: Salary + Charges */
  totalCost: number;
}

// ─── Request body DTOs ────────────────────────────────────────────────────────

export interface CreateMeiDto {
  name: string;
  cnpj?: string;
  cnae?: string;
  annualLimit?: number;
  plan?: string;
}

export interface UpdateMeiDto {
  name: string;
  cnae?: string;
  annualLimit?: number;
  plan?: string;
}

export interface CreateTransactionDto {
  type: string;
  category?: string;
  amount: number;
  date: string; // "YYYY-MM-DD"
  description?: string;
}

export interface UpdateTransactionDto extends CreateTransactionDto {}

export interface CreateProductDto {
  name: string;
  cost: number;
  price: number;
  desiredMargin: number;
  status: string;
}

export interface UpdateProductDto extends CreateProductDto {}

export interface CreateEmployeeDto {
  name: string;
  contractType: string;
  salary: number;
  charges: number;
}

// ─── Legacy entity types (kept for backwards compatibility) ──────────────────

export type TransactionType = "income" | "expense";
export type ImportStatus = "pending" | "processing" | "completed" | "failed";
export type ContractType = "CLT" | "PJ" | "Freelancer";

// ─── Import preview ───────────────────────────────────────────────────────────
// Returned by POST /imports/preview. The same object is sent back
// as the request body to POST /imports/confirm once the user approves.

export interface ImportTransactionPreview {
  type: string;
  category: string | null;
  amount: number;
  description: string | null;
  date: string; // "YYYY-MM-DD"
}

export interface ImportProductPreview {
  name: string;
  cost: number | null;
  price: number | null;
  desiredMargin: number | null;
}

export interface ImportEmployeePreview {
  name: string;
  contractType: string | null;
  salary: number | null;
  charges: number | null;
}

export interface ImportPreview {
  fileUri: string;
  fileName: string;
  transactions: ImportTransactionPreview[];
  products: ImportProductPreview[];
  employees: ImportEmployeePreview[];
  totalRows: number;
  processedRows: number;
  errors: string[];
  status: string;
}

/** GET /v1/meis/:id/imports  |  POST /imports/confirm */
export interface ImportResult {
  id: string;
  meiId: string;
  fileUri: string;
  status: string;
  totalRows: number | null;
  processedRows: number | null;
  errors: string[] | null;
  createdAt: string;
  updatedAt: string | null;
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

// ─── Chat ─────────────────────────────────────────────────────────────────────

export interface ChatMessage {
  role: "user" | "assistant";
  content: string;
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
  user: UserProfile;
  tokens: AuthTokens;
}
