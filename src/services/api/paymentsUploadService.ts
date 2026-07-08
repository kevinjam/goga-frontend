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
      payload
    );
    return response.data;
  }
};
