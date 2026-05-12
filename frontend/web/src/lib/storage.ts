// ─── Token storage helpers (localStorage + cookie for middleware) ─────────────

const REFRESH_TOKEN_KEY = "lumemei_refresh_token";
const ACTIVE_MEI_KEY = "lumemei_active_mei_id";

/** Persist tokens. Also sets a same-site cookie so Next.js middleware can read it. */
export function setTokens(_accessToken: string, refreshToken: string): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
  const maxAge = 30 * 24 * 60 * 60; // 30 days in seconds
  document.cookie = `lumemei_refresh=${encodeURIComponent(refreshToken)}; path=/; max-age=${maxAge}; SameSite=Lax`;
}

export function getRefreshToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(REFRESH_TOKEN_KEY);
}

/** Remove all auth state — localStorage + cookie. */
export function clearTokens(): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem(REFRESH_TOKEN_KEY);
  localStorage.removeItem(ACTIVE_MEI_KEY);
  document.cookie =
    "lumemei_refresh=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; SameSite=Lax";
}

export function getActiveMeiId(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(ACTIVE_MEI_KEY);
}

export function setActiveMeiId(id: string): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(ACTIVE_MEI_KEY, id);
}
