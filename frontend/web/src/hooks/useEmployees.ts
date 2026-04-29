"use client";
import { useQuery } from "@tanstack/react-query";
import { useMeiContext } from "@/context";
import { employeesService } from "@/services/employees.service";

export function useEmployees() {
  const { activeMei } = useMeiContext();

  return useQuery({
    queryKey: ["employees", activeMei?.id],
    queryFn: () => employeesService.getAll(activeMei!.id),
    enabled: !!activeMei,
  });
}

export function useEmployeeStats() {
  const { activeMei } = useMeiContext();

  return useQuery({
    queryKey: ["employee-stats", activeMei?.id],
    queryFn: () => employeesService.getStats(activeMei!.id),
    enabled: !!activeMei,
  });
}
