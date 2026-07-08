import axios from "axios";
import {
  clearAuthSession,
  getAccessToken,
  getRefreshToken,
  setAuthSession
} from "@/lib/auth-storage";
import type { AuthTokens } from "@/types/auth";

const axiosInstance = axios.create({
  baseURL:
    process.env.NEXT_PUBLIC_API_URL ?? process.env.NEXT_PUBLIC_API_BASE_URL,
  timeout: 15000,
  headers: {
    "Content-Type": "application/json"
  }
});

let isRefreshing = false;
let refreshPromise: Promise<AuthTokens | null> | null = null;

async function refreshAccessToken(): Promise<AuthTokens | null> {
  const refreshToken = getRefreshToken();
  if (!refreshToken) return null;

  const baseURL =
    process.env.NEXT_PUBLIC_API_URL ?? process.env.NEXT_PUBLIC_API_BASE_URL;

  try {
    const response = await axios.post(
      `${baseURL}/auth/refresh`,
      { refreshToken },
      { headers: { "Content-Type": "application/json" } }
    );

    const tokens = response.data?.tokens as AuthTokens | undefined;
    if (!tokens?.accessToken || !tokens?.refreshToken) return null;

    setAuthSession(tokens);
    return tokens;
  } catch {
    return null;
  }
}

axiosInstance.interceptors.request.use(
  (config) => {
    const token = getAccessToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error?.config as
      | (typeof error.config & { _retry?: boolean })
      | undefined;
    const status = error?.response?.status as number | undefined;

    if (
      status !== 401 ||
      !originalRequest ||
      originalRequest._retry ||
      originalRequest.url?.includes("/auth/login") ||
      originalRequest.url?.includes("/auth/verify-login") ||
      originalRequest.url?.includes("/auth/resend-code") ||
      originalRequest.url?.includes("/auth/refresh")
    ) {
      return Promise.reject(error);
    }

    originalRequest._retry = true;

    if (!isRefreshing) {
      isRefreshing = true;
      refreshPromise = refreshAccessToken().finally(() => {
        isRefreshing = false;
      });
    }

    const newTokens = await refreshPromise;

    if (!newTokens?.accessToken) {
      clearAuthSession();
      if (typeof window !== "undefined") {
        window.location.href = "/login";
      }
      return Promise.reject(error);
    }

    originalRequest.headers.Authorization = `Bearer ${newTokens.accessToken}`;
    return axiosInstance(originalRequest);
  }
);

export default axiosInstance;
