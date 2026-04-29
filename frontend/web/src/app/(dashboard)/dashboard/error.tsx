"use client";

import { useEffect } from "react";
import { AlertTriangle } from "lucide-react";

export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[Dashboard Error]", error);
  }, [error]);

  return (
    <div className="flex flex-col items-center justify-center h-96 text-center animate-fade-in">
      <div className="w-14 h-14 rounded-2xl bg-status-error/10 border border-status-error/20 flex items-center justify-center mb-4">
        <AlertTriangle className="w-7 h-7 text-status-error" />
      </div>
      <h2 className="font-display text-xl font-bold text-on-surface mb-2">
        Something went wrong
      </h2>
      <p className="text-on-muted text-sm max-w-sm mb-6">
        {error.message ??
          "An unexpected error occurred while loading this page."}
      </p>
      <button
        onClick={reset}
        className="px-5 py-2 rounded-lg bg-accent text-white font-semibold text-sm hover:bg-accent-muted transition-colors"
      >
        Try again
      </button>
    </div>
  );
}
