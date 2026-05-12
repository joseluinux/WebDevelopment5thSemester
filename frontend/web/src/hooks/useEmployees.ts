import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import apiClient from "@/lib/apiClient";
import type { EmployeeResult, CreateEmployeeDto } from "@/types";

export function useEmployees(meiId: string) {
  return useQuery({
    queryKey: ["employees", meiId],
    queryFn: async () => {
      const { data } = await apiClient.get<EmployeeResult[]>(
        `/v1/meis/${meiId}/employees`,
      );
      return data;
    },
    enabled: !!meiId,
  });
}

export function useCreateEmployee(meiId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (dto: CreateEmployeeDto) =>
      apiClient.post(`/v1/meis/${meiId}/employees`, dto).then((r) => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["employees", meiId] }),
  });
}
