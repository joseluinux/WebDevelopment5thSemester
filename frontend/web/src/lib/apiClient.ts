import axios from "axios";
import { getRefreshToken, setTokens, clearTokens } from "./storage";
import type { LoginResponse } from "@/types";

const _rawUrl =
  process.env.NEXT_PUBLIC_API_URL ?? "https://api.cs.lumemei.com.br";
// Guard: se o env var foi buildado sem protocolo (ex: "api.cs.lumemei.com.br"),
// o Axios trataria como caminho relativo → https://lumemei.com.br/api.cs... (errado)
const BASE_URL = _rawUrl.startsWith("http") ? _rawUrl : `https://${_rawUrl}`;

// ─── Module-level access token (never persisted to disk) ─────────────────────
let _accessToken: string | null = null;

export function setAccessToken(token: string | null): void {
  _accessToken = token;
}

// ─── Axios instance ───────────────────────────────────────────────────────────
const apiClient = axios.create({
  baseURL: BASE_URL,
  headers: { "Content-Type": "application/json" },
});

// Request: inject Authorization header when we have a token
apiClient.interceptors.request.use((config) => {
  if (_accessToken) {
    config.headers["Authorization"] = `Bearer ${_accessToken}`;
  }
  return config;
});

// Response: on 401, try to refresh the access token, then retry the request
let isRefreshing = false;
let failedQueue: Array<{
  resolve: (token: string) => void;
  reject: (err: unknown) => void;
}> = [];

function processQueue(error: unknown, token: string | null): void {
  failedQueue.forEach(({ resolve, reject }) => {
    if (error) reject(error);
    else resolve(token!);
  });
  failedQueue = [];
}

apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const original = error.config as typeof error.config & { _retry?: boolean };

    if (error.response?.status === 401 && !original._retry) {
      if (isRefreshing) {
        return new Promise<string>((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        }).then((token) => {
          original.headers["Authorization"] = `Bearer ${token}`;
          return apiClient(original);
        });
      }

      original._retry = true;
      isRefreshing = true;

      const refreshToken = getRefreshToken();
      if (!refreshToken) {
        isRefreshing = false;
        clearTokens();
        setAccessToken(null);
        if (typeof window !== "undefined") window.location.href = "/login";
        return Promise.reject(error);
      }

      try {
        const { data } = await axios.post<LoginResponse>(
          `${BASE_URL}/v1/auth/refresh`,
          { token: refreshToken },
        );
        setTokens(data.accessToken, data.refreshToken);
        setAccessToken(data.accessToken);
        processQueue(null, data.accessToken);
        original.headers["Authorization"] = `Bearer ${data.accessToken}`;
        return apiClient(original);
      } catch (refreshError) {
        processQueue(refreshError, null);
        clearTokens();
        setAccessToken(null);
        if (typeof window !== "undefined") window.location.href = "/login";
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  },
);

export default apiClient;
