// ─── Categorias de transação ──────────────────────────────────────────────────
export const TRANSACTION_CATEGORIES = [
  "Revenue",
  "Hardware",
  "Infrastructure",
  "Travel",
  "Marketing",
  "Software",
  "Serviços",
  "Impostos",
  "Pessoal",
  "Outros",
] as const;

export type TransactionCategory = (typeof TRANSACTION_CATEGORIES)[number];

// ─── Tipos de contrato ────────────────────────────────────────────────────────
export const CONTRACT_TYPES = ["CLT", "PJ", "Freelancer"] as const;

// ─── Períodos de filtro ───────────────────────────────────────────────────────
export const FILTER_PERIODS = [
  { label: "Últimos 7 dias", value: "7d" },
  { label: "Últimos 30 dias", value: "30d" },
  { label: "Últimos 90 dias", value: "90d" },
  { label: "Este ano", value: "1y" },
  { label: "Personalizado", value: "custom" },
] as const;

// ─── Planos ───────────────────────────────────────────────────────────────────
export const PLANS = {
  starter: {
    label: "Starter",
    price: 0,
    features: [
      "Gestão básica de despesas",
      "Cálculo de lucro mensal",
      "Acesso mobile",
    ],
  },
  pro: {
    label: "Pro Oracle",
    price: 49.9,
    features: [
      "Inteligência Preditiva de Caixa",
      "Relatórios DASN Automatizados",
      "Consultoria AI Financeira 24/7",
      "Suporte Prioritário",
    ],
  },
} as const;

// ─── Limite anual MEI ─────────────────────────────────────────────────────────
export const MEI_ANNUAL_LIMIT = 81000;

// ─── Status de importação ─────────────────────────────────────────────────────
export const IMPORT_STATUS_LABELS: Record<string, string> = {
  pending: "Pending Queue",
  processing: "Processing",
  completed: "Completed",
  failed: "Failed",
};

// ─── Navegação do Dashboard ────────────────────────────────────────────────────
export const DASHBOARD_NAV = [
  { label: "Dashboard", href: "/dashboard", icon: "LayoutDashboard" },
  {
    label: "Transactions",
    href: "/dashboard/transactions",
    icon: "CreditCard",
  },
  { label: "Import", href: "/dashboard/import", icon: "Upload" },
  { label: "Products", href: "/dashboard/products", icon: "Package" },
  { label: "Employees", href: "/dashboard/employees", icon: "Users" },
  { label: "Oracle AI", href: "/dashboard/oracle-ai", icon: "Brain" },
  { label: "Insights", href: "/dashboard/insights", icon: "TrendingUp" },
  { label: "Settings", href: "/dashboard/settings", icon: "Settings" },
] as const;
