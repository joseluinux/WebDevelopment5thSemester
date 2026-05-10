"use client";
import { useQuery } from "@tanstack/react-query";
import { useMeiContext } from "@/context";
import { aiService } from "@/services/ai.service";

export function useInsights() {
  const { activeMei } = useMeiContext();

  return useQuery({
    queryKey: ["insights", activeMei?.id],
    queryFn: () => aiService.getInsights(activeMei!.id),
    enabled: !!activeMei,
    staleTime: 1000 * 60 * 10, // 10 min
  });
}
