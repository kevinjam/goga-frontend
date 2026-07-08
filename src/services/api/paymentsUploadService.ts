import axiosInstance from "@/services/api/axiosInstance";
import type {
  ImportPaymentsRequest,
  ImportPaymentsResponse
} from "@/types/payments-upload";

export const paymentsUploadService = {
  async importPayments(
    payload: ImportPaymentsRequest
  ): Promise<ImportPaymentsResponse> {
    const response = await axiosInstance.post<ImportPaymentsResponse>(
      "/payments/import",
      payload,
      {
        // Import can include receipt generation + email automation, which may
        // legitimately take longer than the default API timeout.
        timeout: 180000
      }
    );
    return response.data;
  }
};
