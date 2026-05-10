import { cn } from "@/lib/cn";

interface ProgressBarProps {
  value: number; // 0–100
  max?: number;
  className?: string;
  color?: "accent" | "warning" | "danger" | "success";
  showLabel?: boolean;
}

const colorMap = {
  accent: "bg-accent",
  warning: "bg-status-warning",
  danger: "bg-status-error",
  success: "bg-status-success",
};

export function ProgressBar({
  value,
  max = 100,
  className,
  color = "accent",
  showLabel = false,
}: ProgressBarProps) {
  const pct = Math.min((value / max) * 100, 100);
  const resolved = pct > 85 ? "warning" : pct > 95 ? "danger" : color;

  return (
    <div className={cn("w-full", className)}>
      <div className="w-full h-2 rounded-full bg-obsidian-elevated overflow-hidden">
        <div
          className={cn(
            "h-full rounded-full transition-all duration-700",
            colorMap[resolved],
          )}
          style={{ width: `${pct}%` }}
        />
      </div>
      {showLabel && (
        <p className="text-on-muted text-xs mt-1 text-right">
          {pct.toFixed(0)}%
        </p>
      )}
    </div>
  );
}
