import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import apiClient from "@/lib/apiClient";
import type {
  TransactionResult,
  CreateTransactionDto,
  UpdateTransactionDto,
} from "@/types";

export interface TransactionFilters {
  meiId: string;
  from?: string; // "YYYY-MM-DD"
  to?: string; // "YYYY-MM-DD"
  type?: string;
  category?: string;
}

export function useTransactions(filters: TransactionFilters) {
  return useQuery({
    queryKey: ["transactions", filters],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (filters.from) params.set("from", filters.from);
      if (filters.to) params.set("to", filters.to);
      if (filters.type) params.set("type", filters.type);
      if (filters.category) params.set("category", filters.category);
      const qs = params.toString();
      const { data } = await apiClient.get<TransactionResult[]>(
        `/v1/meis/${filters.meiId}/transactions${qs ? `?${qs}` : ""}`,
      );
      return data;
    },
    enabled: !!filters.meiId,
  });
}

export function useCreateTransaction(meiId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (dto: CreateTransactionDto) =>
      apiClient
        .post<TransactionResult>(`/v1/meis/${meiId}/transactions`, dto)
        .then((r) => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["transactions"] }),
  });
}

export function useUpdateTransaction(meiId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, dto }: { id: string; dto: UpdateTransactionDto }) =>
      apiClient
        .put<TransactionResult>(`/v1/meis/${meiId}/transactions/${id}`, dto)
        .then((r) => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["transactions"] }),
  });
}

export function useDeleteTransaction(meiId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) =>
      apiClient.delete(`/v1/meis/${meiId}/transactions/${id}`),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["transactions"] }),
  });
}
