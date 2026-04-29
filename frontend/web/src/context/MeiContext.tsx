"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { meiService } from "@/services/mei.service";
import type { Mei } from "@/types";

interface MeiContextValue {
  meis: Mei[];
  activeMei: Mei | null;
  isLoading: boolean;
  setActiveMei: (meiId: string) => void;
  refetch: () => Promise<void>;
}

const MeiContext = createContext<MeiContextValue | null>(null);

export function MeiProvider({ children }: { children: React.ReactNode }) {
  const [meis, setMeis] = useState<Mei[]>([]);
  const [activeMeiId, setActiveMeiId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetch = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await meiService.getAll();
      setMeis(data);
      // restaura MEI ativo do localStorage ou usa o primeiro
      const stored = localStorage.getItem("lumemei_active_mei");
      const valid = data.find((m) => m.id === stored);
      setActiveMeiId(valid?.id ?? data[0]?.id ?? null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetch();
  }, [fetch]);

  const setActiveMei = useCallback((meiId: string) => {
    setActiveMeiId(meiId);
    localStorage.setItem("lumemei_active_mei", meiId);
  }, []);

  const activeMei = useMemo(
    () => meis.find((m) => m.id === activeMeiId) ?? null,
    [meis, activeMeiId],
  );

  const value = useMemo(
    () => ({ meis, activeMei, isLoading, setActiveMei, refetch: fetch }),
    [meis, activeMei, isLoading, setActiveMei, fetch],
  );

  return <MeiContext.Provider value={value}>{children}</MeiContext.Provider>;
}

export function useMeiContext() {
  const ctx = useContext(MeiContext);
  if (!ctx) throw new Error("useMeiContext must be used within MeiProvider");
  return ctx;
}
