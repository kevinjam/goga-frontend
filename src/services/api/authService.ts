import axiosInstance from "@/services/api/axiosInstance";
import type {
  AuthResponse,
  LoginChallengeResponse,
  LoginInput,
  RegisterUserInput,
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

  async registerUser(payload: RegisterUserInput): Promise<AuthResponse["user"]> {
    const response = await axiosInstance.post<AuthResponse["user"]>(
      "/auth/register",
      payload
    );
    return response.data;
  },

  // Placeholder: backend endpoint not implemented yet.
  async requestPasswordReset(email: string): Promise<void> {
    await axiosInstance.post("/auth/forgot-password", { email });
  }
};
