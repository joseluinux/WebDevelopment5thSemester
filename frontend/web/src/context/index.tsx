"use client";

import React from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AuthProvider } from "./AuthContext";
import { MeiProvider } from "./MeiContext";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 min
      retry: 1,
    },
  },
});

export function AppProviders({ children }: { children: React.ReactNode }) {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <MeiProvider>{children}</MeiProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export { useAuthContext } from "./AuthContext";
export { useMeiContext } from "./MeiContext";
