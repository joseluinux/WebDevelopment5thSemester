"use client";
import { useQuery } from "@tanstack/react-query";
import { useMeiContext } from "@/context";
import { transactionsService } from "@/services/transactions.service";
import type { TransactionFilters } from "@/types";

export function useTransactions(filters?: TransactionFilters) {
  const { activeMei } = useMeiContext();

  return useQuery({
    queryKey: ["transactions", activeMei?.id, filters],
    queryFn: () => transactionsService.getAll(activeMei!.id, filters),
    enabled: !!activeMei,
  });
}

export function useDashboardStats() {
  const { activeMei } = useMeiContext();

  return useQuery({
    queryKey: ["dashboard-stats", activeMei?.id],
    queryFn: () => transactionsService.getDashboardStats(activeMei!.id),
    enabled: !!activeMei,
  });
}

export function useChartData() {
  const { activeMei } = useMeiContext();

  return useQuery({
    queryKey: ["chart-data", activeMei?.id],
    queryFn: () => transactionsService.getChartData(activeMei!.id),
    enabled: !!activeMei,
  });
}
