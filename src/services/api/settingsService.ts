import axiosInstance from "@/services/api/axiosInstance";
import type {
  AuditAction,
  PaginatedAuditLogsResponse,
  PaginatedEmailLogsResponse,
  ResendWelcomeEmailResponse,
  SecuritySettings,
  SettingsUser
} from "@/types/settings";

export const settingsService = {
  async getUsers(signal?: AbortSignal): Promise<SettingsUser[]> {
    const response = await axiosInstance.get<SettingsUser[]>("/users", { signal });
    return response.data;
  },

  async updateUserStatus(
    userId: string,
    isActive: boolean
  ): Promise<SettingsUser> {
    const response = await axiosInstance.patch<SettingsUser>(`/users/${userId}/status`, {
      isActive
    });
    return response.data;
  },

  async getEmailLogs(
    params: { page: number; limit: number },
    signal?: AbortSignal
  ): Promise<PaginatedEmailLogsResponse> {
    const response = await axiosInstance.get<PaginatedEmailLogsResponse>(
      "/email/logs",
      { params, signal }
    );
    return response.data;
  },

  async getAuditLogs(
    params: { page: number; limit: number; action?: AuditAction },
    signal?: AbortSignal
  ): Promise<PaginatedAuditLogsResponse> {
    const response = await axiosInstance.get<PaginatedAuditLogsResponse>(
      "/audit/logs",
      { params, signal }
    );
    return response.data;
  },

  async getSecuritySettings(signal?: AbortSignal): Promise<SecuritySettings> {
    const response = await axiosInstance.get<SecuritySettings>("/settings/security", {
      signal
    });
    return response.data;
  },

  async requestUserPasswordReset(email: string): Promise<{ message: string }> {
    const response = await axiosInstance.post<{ message: string }>(
      "/auth/forgot-password",
      { email }
    );
    return response.data;
  },

  async resendWelcomeEmail(userId: string): Promise<ResendWelcomeEmailResponse> {
    const response = await axiosInstance.post<ResendWelcomeEmailResponse>(
      `/users/${userId}/resend-welcome-email`
    );
    return response.data;
  }
};
