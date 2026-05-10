// ─── Moeda ────────────────────────────────────────────────────────────────────
export function formatCurrency(
  value: number,
  opts?: { compact?: boolean; showSign?: boolean },
): string {
  const abs = Math.abs(value);
  let formatted: string;

  if (opts?.compact && abs >= 1000000) {
    formatted = `R$ ${(abs / 1000000).toFixed(1)}M`;
  } else if (opts?.compact && abs >= 1000) {
    formatted = `R$ ${(abs / 1000).toFixed(1)}k`;
  } else {
    formatted = new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(abs);
  }

  if (opts?.showSign) {
    return value >= 0 ? `+${formatted}` : `-${formatted}`;
  }
  return value < 0 ? `-${formatted}` : formatted;
}

// ─── Data ─────────────────────────────────────────────────────────────────────
export function formatDate(
  dateString: string,
  opts?: { showTime?: boolean; relative?: boolean },
): string {
  const date = new Date(dateString);

  if (opts?.relative) {
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffHours < 1) return "agora";
    if (diffHours < 24) return `${diffHours}h atrás`;
    if (diffDays === 1) return "ontem";
    if (diffDays < 7) return `${diffDays}d atrás`;
  }

  if (opts?.showTime) {
    return new Intl.DateTimeFormat("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(date);
  }

  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(date);
}

export function formatDateShort(dateString: string): string {
  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "short",
  }).format(new Date(dateString));
}

// ─── Percentual ───────────────────────────────────────────────────────────────
export function formatPercent(value: number, decimals = 1): string {
  return `${value.toFixed(decimals)}%`;
}

// ─── Margem ───────────────────────────────────────────────────────────────────
export function calculateMargin(price: number, cost: number): number {
  if (price === 0) return 0;
  return ((price - cost) / price) * 100;
}

// ─── Progresso (limite anual MEI) ─────────────────────────────────────────────
export function calcAnnualLimitPercent(used: number, limit: number): number {
  return Math.min((used / limit) * 100, 100);
}

// ─── Bytes ────────────────────────────────────────────────────────────────────
export function formatBytes(bytes: number): string {
  if (bytes === 0) return "0 B";
  const units = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  return `${(bytes / Math.pow(1024, i)).toFixed(1)} ${units[i]}`;
}

// ─── Número compacto ──────────────────────────────────────────────────────────
export function formatCompactNumber(value: number): string {
  if (value >= 1000000) return `${(value / 1000000).toFixed(1)}M`;
  if (value >= 1000) return `${(value / 1000).toFixed(1)}k`;
  return String(value);
}

// ─── CNPJ ─────────────────────────────────────────────────────────────────────
export function formatCNPJ(cnpj: string): string {
  const digits = cnpj.replace(/\D/g, "");
  if (digits.length !== 14) return cnpj;
  return digits.replace(
    /^(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})$/,
    "$1.$2.$3/$4-$5",
  );
}
