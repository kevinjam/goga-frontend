import axiosInstance from "@/services/api/axiosInstance";
import type {
  AuthResponse,
  ChangePasswordInput,
  LoginChallengeResponse,
  LoginInput,
  RegisterUserInput,
  RegisterUserResponse,
  ResendCodeInput,
  VerifyLoginInput
} from "@/types/auth";

export const authService = {
  async login(payload: LoginInput): Promise<LoginChallengeResponse> {
    const response = await axiosInstance.post<LoginChallengeResponse>(
      "/auth/login",
      payload
    );
    return response.data;
  },

  async verifyLogin(payload: VerifyLoginInput): Promise<AuthResponse> {
    const response = await axiosInstance.post<AuthResponse>(
      "/auth/verify-login",
      payload
    );
    return response.data;
  },

  async resendCode(payload: ResendCodeInput): Promise<{ message: string }> {
    const response = await axiosInstance.post<{ message: string }>(
      "/auth/resend-code",
      payload
    );
    return response.data;
  },

  async refresh(refreshToken: string): Promise<AuthResponse> {
    const response = await axiosInstance.post<AuthResponse>("/auth/refresh", {
      refreshToken
    });
    return response.data;
  },

  async me(): Promise<AuthResponse["user"]> {
    const response = await axiosInstance.get<AuthResponse["user"]>("/auth/me");
    return response.data;
  },

  async registerUser(payload: RegisterUserInput): Promise<RegisterUserResponse> {
    const response = await axiosInstance.post<RegisterUserResponse>(
      "/auth/register",
      payload
    );
    return response.data;
  },

  async changePassword(payload: ChangePasswordInput): Promise<AuthResponse["user"]> {
    const response = await axiosInstance.post<AuthResponse["user"]>(
      "/auth/change-password",
      payload
    );
    return response.data;
  },

  async requestPasswordReset(email: string): Promise<{ message: string }> {
    const response = await axiosInstance.post<{ message: string }>(
      "/auth/forgot-password",
      { email }
    );
    return response.data;
  },

  async resetPassword(payload: {
    token: string;
    newPassword: string;
    confirmPassword: string;
  }): Promise<{ message: string }> {
    const response = await axiosInstance.post<{ message: string }>(
      "/auth/reset-password",
      payload
    );
    return response.data;
  }
};
