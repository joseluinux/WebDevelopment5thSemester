"use client";

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import apiClient from "@/lib/apiClient";
import { getActiveMeiId, setActiveMeiId } from "@/lib/storage";
import { useAuthContext } from "./AuthContext";
import type { MeiResult } from "@/types";

interface MeiContextType {
  meis: MeiResult[];
  activeMei: MeiResult | null;
  isMeisLoading: boolean;
  setActiveMei: (meiId: string) => void;
  refetchMeis: () => void;
}

const MeiContext = createContext<MeiContextType | null>(null);

export function MeiProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuthContext();
  const queryClient = useQueryClient();
  const [activeMeiId, setActiveMeiIdState] = useState<string | null>(null);

  const { data: meis = [], isLoading: isMeisLoading } = useQuery({
    queryKey: ["meis", user?.id],
    queryFn: async () => {
      const { data } = await apiClient.get<MeiResult[]>("/v1/meis");
      return data;
    },
    enabled: !!user,
    staleTime: 1000 * 60 * 5,
  });

  // Resolve activeMei from localStorage or default to first
  useEffect(() => {
    if (meis.length === 0) return;
    const storedId = getActiveMeiId();
    const found = storedId ? meis.find((m) => m.id === storedId) : null;
    if (found) {
      setActiveMeiIdState(found.id);
    } else {
      setActiveMeiIdState(meis[0].id);
      setActiveMeiId(meis[0].id);
    }
  }, [meis]);

  // Use meis[0] as immediate fallback so activeMei is never null when meis exist.
  // The useEffect below persists the selection to localStorage, but derivation
  // must not wait for that effect to avoid a race condition that causes a
  // spurious redirect to /onboarding.
  const activeMei =
    meis.length > 0
      ? (meis.find((m) => m.id === activeMeiId) ?? meis[0])
      : null;

  const setActiveMei = useCallback((meiId: string) => {
    setActiveMeiIdState(meiId);
    setActiveMeiId(meiId);
  }, []);

  const refetchMeis = useCallback(() => {
    queryClient.invalidateQueries({ queryKey: ["meis"] });
  }, [queryClient]);

  return (
    <MeiContext.Provider
      value={{ meis, activeMei, isMeisLoading, setActiveMei, refetchMeis }}
    >
      {children}
    </MeiContext.Provider>
  );
}

export function useMeiContext() {
  const ctx = useContext(MeiContext);
  if (!ctx) throw new Error("useMeiContext must be used within MeiProvider");
  return ctx;
}
