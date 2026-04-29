import axios, { AxiosError, type InternalAxiosRequestConfig } from "axios";
import type { ApiError } from "@/types";

const BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

export const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 30000,
});

// ─── Request interceptor: injeta token ────────────────────────────────────────
api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    if (typeof window !== "undefined") {
      const token = localStorage.getItem("lumemei_token");
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => Promise.reject(error),
);

// ─── Response interceptor: trata erros ───────────────────────────────────────
api.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    if (error.response?.status === 401) {
      if (typeof window !== "undefined") {
        localStorage.removeItem("lumemei_token");
        localStorage.removeItem("lumemei_user");
        window.location.href = "/login";
      }
    }

    const apiError: ApiError = {
      message:
        (error.response?.data as { detail?: string })?.detail ??
        error.message ??
        "Erro desconhecido",
      status: error.response?.status ?? 0,
    };

    return Promise.reject(apiError);
  },
);
