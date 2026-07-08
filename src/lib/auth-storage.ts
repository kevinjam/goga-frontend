import type { AuthTokens } from "@/types/auth";

const ACCESS_TOKEN_KEY = "goga_access_token";
const REFRESH_TOKEN_KEY = "goga_refresh_token";
const COOKIE_MAX_AGE_SECONDS = 60 * 60 * 24 * 7; // 7 days

function setCookie(name: string, value: string, maxAgeSeconds: number) {
  if (typeof document === "undefined") return;
  document.cookie = `${name}=${encodeURIComponent(value)}; path=/; max-age=${maxAgeSeconds}; SameSite=Lax`;
}

function getCookie(name: string): string | null {
  if (typeof document === "undefined") return null;
  const cookies = document.cookie ? document.cookie.split("; ") : [];
  const entry = cookies.find((cookie) => cookie.startsWith(`${name}=`));
  return entry ? decodeURIComponent(entry.split("=")[1]) : null;
}

function clearCookie(name: string) {
  if (typeof document === "undefined") return;
  document.cookie = `${name}=; path=/; max-age=0; SameSite=Lax`;
}

export function setAuthSession(tokens: AuthTokens): void {
  setCookie(ACCESS_TOKEN_KEY, tokens.accessToken, COOKIE_MAX_AGE_SECONDS);
  setCookie(REFRESH_TOKEN_KEY, tokens.refreshToken, COOKIE_MAX_AGE_SECONDS);
}

export function getAccessToken(): string | null {
  return getCookie(ACCESS_TOKEN_KEY);
}

export function getRefreshToken(): string | null {
  return getCookie(REFRESH_TOKEN_KEY);
}

export function clearAuthSession(): void {
  clearCookie(ACCESS_TOKEN_KEY);
  clearCookie(REFRESH_TOKEN_KEY);
}

export const AUTH_COOKIE_KEYS = {
  access: ACCESS_TOKEN_KEY,
  refresh: REFRESH_TOKEN_KEY
};
