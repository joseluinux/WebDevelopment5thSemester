import React from "react";

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
  icon?: React.ReactNode;
  iconPosition?: "left" | "right";
}

export function Input({
  label,
  error,
  helperText,
  icon,
  iconPosition = "left",
  className = "",
  ...props
}: InputProps) {
  return (
    <div className="flex flex-col gap-2 w-full">
      {label && (
        <label className="text-sm font-medium text-gray-300">
          {label}
          {props.required && <span className="text-red-400 ml-1">*</span>}
        </label>
      )}

      <div className="relative flex items-center">
        {icon && iconPosition === "left" && (
          <div className="absolute left-3 text-blue-400 pointer-events-none">
            {icon}
          </div>
        )}

        <input
          className={`
            w-full px-4 py-2 rounded-lg
            bg-slate-900/50 border border-blue-500/20
            text-white placeholder-gray-500
            focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/30
            transition-all duration-300
            ${iconPosition === "left" && icon ? "pl-10" : ""}
            ${iconPosition === "right" && icon ? "pr-10" : ""}
            ${error ? "border-red-500 focus:ring-red-500/30" : ""}
            disabled:opacity-50 disabled:cursor-not-allowed
            ${className}
          `}
          {...props}
        />

        {icon && iconPosition === "right" && (
          <div className="absolute right-3 text-blue-400 pointer-events-none">
            {icon}
          </div>
        )}
      </div>

      {error && <span className="text-sm text-red-400">{error}</span>}

      {helperText && !error && (
        <span className="text-sm text-gray-400">{helperText}</span>
      )}
    </div>
  );
}
