import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import apiClient from "@/lib/apiClient";
import type {
  ProductResult,
  CreateProductDto,
  UpdateProductDto,
} from "@/types";

export function useProducts(meiId: string, status?: string) {
  return useQuery({
    queryKey: ["products", meiId, status],
    queryFn: async () => {
      const qs = status ? `?status=${encodeURIComponent(status)}` : "";
      const { data } = await apiClient.get<ProductResult[]>(
        `/v1/meis/${meiId}/products${qs}`,
      );
      return data;
    },
    enabled: !!meiId,
  });
}

export function useCreateProduct(meiId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (dto: CreateProductDto) =>
      apiClient
        .post<ProductResult>(`/v1/meis/${meiId}/products`, dto)
        .then((r) => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["products", meiId] }),
  });
}

export function useUpdateProduct(meiId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, dto }: { id: string; dto: UpdateProductDto }) =>
      apiClient
        .put<ProductResult>(`/v1/meis/${meiId}/products/${id}`, dto)
        .then((r) => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["products", meiId] }),
  });
}

export function useDeleteProduct(meiId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) =>
      apiClient.delete(`/v1/meis/${meiId}/products/${id}`),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["products", meiId] }),
  });
}
