"use client";
import { useQuery } from "@tanstack/react-query";
import { useMeiContext } from "@/context";
import { productsService } from "@/services/products.service";

export function useProducts() {
  const { activeMei } = useMeiContext();

  return useQuery({
    queryKey: ["products", activeMei?.id],
    queryFn: () => productsService.getAll(activeMei!.id),
    enabled: !!activeMei,
  });
}
