"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState
} from "react";
import { authService } from "@/services/api/authService";
import {
  clearAuthSession,
  getRefreshToken,
  setAuthSession
} from "@/lib/auth-storage";
import type { AuthUser, LoginInput, VerifyLoginInput } from "@/types/auth";
import {
  clearLoginChallenge,
  storeLoginChallenge
} from "@/lib/login-challenge-storage";

interface AuthContextValue {
  user: AuthUser | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  startLogin: (payload: LoginInput) => Promise<void>;
  verifyLogin: (payload: VerifyLoginInput) => Promise<void>;
  logout: () => void;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const refreshUser = useCallback(async () => {
    try {
      const profile = await authService.me();
      setUser(profile);
    } catch {
      setUser(null);
      clearAuthSession();
    }
  }, []);

  const startLogin = useCallback(async (payload: LoginInput) => {
    const challenge = await authService.login(payload);
    storeLoginChallenge(challenge.email);
  }, []);

  const verifyLogin = useCallback(async (payload: VerifyLoginInput) => {
    const response = await authService.verifyLogin(payload);
    setAuthSession(response.tokens);
    setUser(response.user);
    clearLoginChallenge();
  }, []);

  const logout = useCallback(() => {
    clearAuthSession();
    clearLoginChallenge();
    setUser(null);
    if (typeof window !== "undefined") {
      window.location.href = "/login";
    }
  }, []);

  useEffect(() => {
    const bootstrap = async () => {
      const refreshToken = getRefreshToken();
      if (!refreshToken) {
        setIsLoading(false);
        return;
      }

      try {
        const refreshed = await authService.refresh(refreshToken);
        setAuthSession(refreshed.tokens);
        setUser(refreshed.user);
      } catch {
        clearAuthSession();
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    };

    void bootstrap();
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      isLoading,
      isAuthenticated: Boolean(user),
      startLogin,
      verifyLogin,
      logout,
      refreshUser
    }),
    [isLoading, logout, refreshUser, startLogin, verifyLogin, user]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
}
