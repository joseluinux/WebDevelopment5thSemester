"use client";
import { useCallback, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthContext } from "@/context";
import type { LoginRequest, RegisterRequest } from "@/types";

export function useAuth() {
  const ctx = useAuthContext();
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [isPending, setIsPending] = useState(false);

  const login = useCallback(
    async (data: LoginRequest) => {
      setError(null);
      setIsPending(true);
      try {
        await ctx.login(data);
        router.push("/dashboard");
      } catch (err) {
        setError((err as { message: string }).message ?? "Erro ao entrar.");
      } finally {
        setIsPending(false);
      }
    },
    [ctx, router],
  );

  const register = useCallback(
    async (data: RegisterRequest) => {
      setError(null);
      setIsPending(true);
      try {
        await ctx.register(data);
        router.push("/dashboard/onboarding");
      } catch (err) {
        setError(
          (err as { message: string }).message ?? "Erro ao criar conta.",
        );
      } finally {
        setIsPending(false);
      }
    },
    [ctx, router],
  );

  const logout = useCallback(() => {
    ctx.logout();
    router.push("/login");
  }, [ctx, router]);

  return {
    user: ctx.user,
    isAuthenticated: ctx.isAuthenticated,
    isLoading: ctx.isLoading,
    isPending,
    error,
    login,
    register,
    logout,
  };
}
