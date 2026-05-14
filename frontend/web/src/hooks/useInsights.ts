import { useQuery } from "@tanstack/react-query";
import apiClient from "@/lib/apiClient";
import type { InsightsResult } from "@/types";

export function useInsights(meiId: string) {
  return useQuery({
    queryKey: ["insights", meiId],
    queryFn: async () => {
      const { data } = await apiClient.get<InsightsResult>(
        `/v1/meis/${meiId}/insights`,
      );
      return data;
    },
    enabled: !!meiId,
    staleTime: 5 * 60 * 1000,
    // 1 retry so errors surface quickly instead of waiting 3 rounds.
    retry: 1,
    // Always refetch when navigating back to the page so fresh data is shown.
    refetchOnMount: true,
  });
}
