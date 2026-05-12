"use client";

import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
} from "react";
import axios from "axios";
import apiClient, { setAccessToken } from "@/lib/apiClient";
import { getRefreshToken, setTokens, clearTokens } from "@/lib/storage";
import type { UserProfile, LoginResponse } from "@/types";

interface AuthContextType {
  user: UserProfile | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // On mount — try to restore session silently via stored refresh token
  useEffect(() => {
    let cancelled = false;
    async function restore() {
      const refreshToken = getRefreshToken();
      if (!refreshToken) {
        setIsLoading(false);
        return;
      }
      try {
        const BASE_URL =
          process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8080";
        const { data } = await axios.post<LoginResponse>(
          `${BASE_URL}/v1/auth/refresh`,
          { token: refreshToken },
        );
        setTokens(data.accessToken, data.refreshToken);
        setAccessToken(data.accessToken);
        const { data: profile } =
          await apiClient.get<UserProfile>("/v1/users/me");
        if (!cancelled) setUser(profile);
      } catch {
        clearTokens();
        setAccessToken(null);
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    }
    restore();
    return () => {
      cancelled = true;
    };
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    const { data } = await apiClient.post<LoginResponse>("/v1/auth/login", {
      email,
      password,
    });
    setTokens(data.accessToken, data.refreshToken);
    setAccessToken(data.accessToken);
    const { data: profile } = await apiClient.get<UserProfile>("/v1/users/me");
    setUser(profile);
  }, []);

  const register = useCallback(
    async (name: string, email: string, password: string) => {
      await apiClient.post("/v1/auth/register", { name, email, password });
    },
    [],
  );

  const logout = useCallback(async () => {
    const refreshToken = getRefreshToken();
    if (refreshToken) {
      try {
        await apiClient.post("/v1/auth/logout", { token: refreshToken });
      } catch {
        // Ignore logout errors — still clear local state
      }
    }
    clearTokens();
    setAccessToken(null);
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider value={{ user, isLoading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuthContext() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuthContext must be used within AuthProvider");
  return ctx;
}
