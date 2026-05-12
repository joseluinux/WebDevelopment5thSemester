import { useMutation, useQueryClient } from "@tanstack/react-query";
import apiClient from "@/lib/apiClient";
import type { MeiResult, CreateMeiDto, UpdateMeiDto } from "@/types";

// ─── Mutations (read via useMeiContext().meis) ────────────────────────────────

export function useCreateMei() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (dto: CreateMeiDto) =>
      apiClient.post<MeiResult>("/v1/meis", dto).then((r) => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["meis"] }),
  });
}

export function useUpdateMei(meiId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (dto: UpdateMeiDto) =>
      apiClient.put<MeiResult>(`/v1/meis/${meiId}`, dto).then((r) => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["meis"] }),
  });
}

export function useDeleteMei() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (meiId: string) => apiClient.delete(`/v1/meis/${meiId}`),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["meis"] }),
  });
}
