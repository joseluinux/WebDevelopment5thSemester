"use client";
import { useQuery } from "@tanstack/react-query";
import { useMeiContext } from "@/context";
import { importsService } from "@/services/imports.service";

export function useImports() {
  const { activeMei } = useMeiContext();

  return useQuery({
    queryKey: ["imports", activeMei?.id],
    queryFn: () => importsService.getAll(activeMei!.id),
    enabled: !!activeMei,
    refetchInterval: (query) => {
      const data = query.state.data;
      const hasProcessing = data?.some(
        (imp) => imp.status === "processing" || imp.status === "pending",
      );
      return hasProcessing ? 5000 : false;
    },
  });
}
