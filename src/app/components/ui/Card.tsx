import React from "react";

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "elevated" | "filled";
  padding?: "sm" | "md" | "lg";
  children: React.ReactNode;
}

const paddingClasses = {
  sm: "p-3",
  md: "p-6",
  lg: "p-8",
};

const variantClasses = {
  default:
    "rounded-xl border border-blue-500/20 bg-slate-900/50 backdrop-blur-sm transition-colors duration-300 hover:border-blue-500/40",
  elevated:
    "rounded-xl border border-blue-500/30 bg-slate-900/50 backdrop-blur-sm transition-colors duration-300 hover:border-blue-500/40 shadow-lg shadow-blue-500/20",
  filled:
    "rounded-xl border border-blue-500/10 bg-slate-800/50 backdrop-blur-sm transition-colors duration-300 hover:border-blue-500/20",
};

export function Card({
  variant = "default",
  padding = "md",
  children,
  className = "",
  ...props
}: CardProps) {
  return (
    <div
      className={`${variantClasses[variant]} ${paddingClasses[padding]} ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}
