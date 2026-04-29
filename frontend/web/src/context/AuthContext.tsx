"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { authService } from "@/services/auth.service";
import type { LoginRequest, RegisterRequest, User } from "@/types";

interface AuthContextValue {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (data: LoginRequest) => Promise<void>;
  register: (data: RegisterRequest) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // ─── Hidrata sessão ao montar ──────────────────────────────────────────────
  useEffect(() => {
    try {
      const storedToken = localStorage.getItem("lumemei_token");
      const storedUser = localStorage.getItem("lumemei_user");
      if (storedToken && storedUser) {
        setToken(storedToken);
        setUser(JSON.parse(storedUser) as User);
      }
    } catch {
      // storage inacessível (SSR guard)
    } finally {
      setIsLoading(false);
    }
  }, []);

  const persist = useCallback((u: User, t: string) => {
    setUser(u);
    setToken(t);
    localStorage.setItem("lumemei_token", t);
    localStorage.setItem("lumemei_user", JSON.stringify(u));
    // cookie legível pelo middleware (server-side)
    document.cookie = `lumemei_token=${t}; path=/; max-age=${60 * 60 * 24 * 7}; SameSite=Lax`;
  }, []);

  const login = useCallback(
    async (data: LoginRequest) => {
      const session = await authService.login(data);
      persist(session.user, session.tokens.access_token);
    },
    [persist],
  );

  const register = useCallback(
    async (data: RegisterRequest) => {
      const session = await authService.register(data);
      persist(session.user, session.tokens.access_token);
    },
    [persist],
  );

  const logout = useCallback(() => {
    authService.logout();
    setUser(null);
    setToken(null);
  }, []);

  const value = useMemo(
    () => ({
      user,
      token,
      isAuthenticated: !!token && !!user,
      isLoading,
      login,
      register,
      logout,
    }),
    [user, token, isLoading, login, register, logout],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuthContext() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuthContext must be used within AuthProvider");
  return ctx;
}
