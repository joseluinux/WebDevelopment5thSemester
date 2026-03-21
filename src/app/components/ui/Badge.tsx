import React from "react";

type BadgeVariant = "primary" | "secondary" | "success" | "warning" | "error";

interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant;
  icon?: React.ReactNode;
  children: React.ReactNode;
}

const variantStyles: Record<
  BadgeVariant,
  { bg: string; text: string; border: string }
> = {
  primary: {
    bg: "bg-blue-500/10",
    text: "text-blue-300",
    border: "border-blue-500/30",
  },
  secondary: {
    bg: "bg-purple-500/10",
    text: "text-purple-300",
    border: "border-purple-500/30",
  },
  success: {
    bg: "bg-green-500/10",
    text: "text-green-300",
    border: "border-green-500/30",
  },
  warning: {
    bg: "bg-yellow-500/10",
    text: "text-yellow-300",
    border: "border-yellow-500/30",
  },
  error: {
    bg: "bg-red-500/10",
    text: "text-red-300",
    border: "border-red-500/30",
  },
};

export function Badge({
  variant = "primary",
  icon,
  children,
  className = "",
  ...props
}: BadgeProps) {
  const styles = variantStyles[variant];

  return (
    <span
      className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium ${styles.bg} ${styles.text} border ${styles.border} ${className}`}
      {...props}
    >
      {icon && <span className="inline-flex items-center">{icon}</span>}
      {children}
    </span>
  );
}
