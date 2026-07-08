import axiosInstance from "@/services/api/axiosInstance";
import type { PaginatedEmailLogsResponse, SettingsUser } from "@/types/settings";

export const settingsService = {
  async getUsers(signal?: AbortSignal): Promise<SettingsUser[]> {
    const response = await axiosInstance.get<SettingsUser[]>("/users", { signal });
    return response.data;
  },

  async getEmailLogs(
    params: { page: number; limit: number },
    signal?: AbortSignal
  ): Promise<PaginatedEmailLogsResponse> {
    const response = await axiosInstance.get<PaginatedEmailLogsResponse>(
      "/email/logs",
      {
        params,
        signal
      }
    );
    return response.data;
  }
};

