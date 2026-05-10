"use client";

import { useEffect } from "react";

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
      <div className="w-14 h-14 rounded-2xl bg-error/10 border border-error/20 flex items-center justify-center mb-4">
        <span className="material-symbols-outlined text-error">warning</span>
      </div>
      <h2 className="font-display text-xl font-bold text-on-surface mb-2">
        Something went wrong
      </h2>
      <p className="text-on-surface-variant text-sm max-w-sm mb-6">
        {error.message ??
          "An unexpected error occurred while loading this page."}
      </p>
      <button
        onClick={reset}
        className="px-5 py-2 rounded-lg prism-gradient text-[#002979] font-semibold text-sm transition-colors"
      >
        Try again
      </button>
    </div>
  );
}
