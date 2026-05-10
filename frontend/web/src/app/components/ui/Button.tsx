import React from "react";

type ButtonVariant = "primary" | "secondary" | "ghost" | "text";
type ButtonSize = "sm" | "md" | "lg";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  isLoading?: boolean;
  icon?: React.ReactNode;
  iconPosition?: "left" | "right";
  children: React.ReactNode;
}

const variantClasses: Record<ButtonVariant, string> = {
  primary:
    "inline-flex items-center justify-center rounded-lg font-semibold transition-all duration-300 bg-gradient-to-r from-blue-500 to-purple-600 text-white hover:scale-105 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2 focus:ring-offset-slate-900",
  secondary:
    "inline-flex items-center justify-center rounded-lg font-semibold transition-all duration-300 border-2 border-blue-500 text-blue-300 hover:bg-blue-500/10 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2 focus:ring-offset-slate-900",
  ghost:
    "inline-flex items-center justify-center rounded-lg font-semibold transition-all duration-300 text-blue-400 hover:bg-blue-500/10 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2 focus:ring-offset-slate-900",
  text: "inline-flex items-center justify-center font-semibold transition-colors duration-300 text-blue-400 underline hover:text-blue-300 focus:outline-none",
};

const sizeClasses: Record<ButtonSize, string> = {
  sm: "px-4 py-2 text-sm",
  md: "px-6 py-3 text-base",
  lg: "px-8 py-4 text-lg",
};

export function Button({
  variant = "primary",
  size = "md",
  isLoading = false,
  icon,
  iconPosition = "left",
  disabled = false,
  children,
  className = "",
  ...props
}: ButtonProps) {
  const baseClasses = `${variantClasses[variant]} ${sizeClasses[size]}`;
  const finalClasses = `${baseClasses} ${disabled || isLoading ? "opacity-50 cursor-not-allowed" : ""} ${className}`;

  return (
    <button
      disabled={disabled || isLoading}
      className={finalClasses}
      {...props}
    >
      <div className="flex items-center justify-center gap-2">
        {icon && iconPosition === "left" && (
          <span className="inline-flex items-center justify-center">
            {isLoading ? <LoadingSpinner /> : icon}
          </span>
        )}

        <span>{children}</span>

        {icon && iconPosition === "right" && !isLoading && (
          <span className="inline-flex items-center justify-center">
            {icon}
          </span>
        )}
      </div>
    </button>
  );
}

/**
 * Componente de Loading spinner para mostrar quando isLoading={true}
 */
function LoadingSpinner() {
  return (
    <svg
      className="animate-spin h-4 w-4"
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
    >
      <circle
        className="opacity-25"
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="4"
      ></circle>
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
      ></path>
    </svg>
  );
}
