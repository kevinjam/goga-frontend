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
  setAuthSession,
  setMustChangePasswordFlag
} from "@/lib/auth-storage";
import type {
  AuthUser,
  ChangePasswordInput,
  LoginInput,
  VerifyLoginInput
} from "@/types/auth";
import {
  clearLoginChallenge,
  storeLoginChallenge
} from "@/lib/login-challenge-storage";

interface AuthContextValue {
  user: AuthUser | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  mustChangePassword: boolean;
  startLogin: (payload: LoginInput) => Promise<void>;
  verifyLogin: (payload: VerifyLoginInput) => Promise<AuthUser>;
  changePassword: (payload: ChangePasswordInput) => Promise<void>;
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
      setMustChangePasswordFlag(profile.mustChangePassword);
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
    setAuthSession(response.tokens, response.user);
    setUser(response.user);
    clearLoginChallenge();
    return response.user;
  }, []);

  const changePassword = useCallback(async (payload: ChangePasswordInput) => {
    const updatedUser = await authService.changePassword(payload);
    setUser(updatedUser);
    setMustChangePasswordFlag(updatedUser.mustChangePassword);
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
        setAuthSession(refreshed.tokens, refreshed.user);
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
      mustChangePassword: Boolean(user?.mustChangePassword),
      startLogin,
      verifyLogin,
      changePassword,
      logout,
      refreshUser
    }),
    [changePassword, isLoading, logout, refreshUser, startLogin, verifyLogin, user]
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
