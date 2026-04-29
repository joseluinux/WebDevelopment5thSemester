import { cn } from "@/lib/cn";

interface StatCardProps {
  label: string;
  value: string;
  change?: number;
  changeLabel?: string;
  accent?: boolean;
  className?: string;
}

export function StatCard({
  label,
  value,
  change,
  changeLabel,
  accent = false,
  className,
}: StatCardProps) {
  const isPositive = change !== undefined && change >= 0;
  const isNeutral = change === undefined;

  return (
    <div
      className={cn(
        "bg-obsidian-card rounded-card p-5 border border-obsidian-elevated/50 flex flex-col gap-2",
        className,
      )}
    >
      <p className="text-on-muted text-xs uppercase tracking-widest font-semibold">
        {label}
      </p>
      <p
        className={cn(
          "font-display text-2xl font-bold tracking-tight",
          accent ? "text-accent-light" : "text-on-surface",
        )}
      >
        {value}
      </p>
      {!isNeutral && (
        <p
          className={cn(
            "text-xs flex items-center gap-1",
            isPositive ? "text-status-success" : "text-status-error",
          )}
        >
          <span>{isPositive ? "↗" : "↘"}</span>
          <span>
            {isPositive ? "+" : ""}
            {change}% {changeLabel ?? "vs last mo"}
          </span>
        </p>
      )}
      {isNeutral && changeLabel && (
        <p className="text-on-muted text-xs">{changeLabel}</p>
      )}
    </div>
  );
}
