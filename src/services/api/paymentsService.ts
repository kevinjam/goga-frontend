import axiosInstance from "@/services/api/axiosInstance";
import type {
  PaymentQueryParams,
  PaymentRecord,
  PaymentsResponse,
  ReceiptListResponse,
  ReceiptRecord
} from "@/types/payments";

const RECEIPT_LOOKUP_PAGE_SIZE = 100;

function toBlobObjectUrl(blob: Blob): string {
  return URL.createObjectURL(blob);
}

export const paymentsService = {
  async getPayments(
    params: PaymentQueryParams,
    signal?: AbortSignal
  ): Promise<PaymentsResponse> {
    const response = await axiosInstance.get<PaymentsResponse>("/payments", {
      params: {
        page: params.page,
        limit: params.limit,
        search: params.search || undefined,
        status: params.status || undefined
      },
      signal
    });
    return response.data;
  },

  async getPaymentById(id: string): Promise<PaymentRecord> {
    const response = await axiosInstance.get<PaymentRecord>(`/payments/${id}`);
    return response.data;
  },

  async getPaymentDetails(id: string): Promise<PaymentRecord> {
    return this.getPaymentById(id);
  },

  async getReceiptAssetUrl(receiptId: string): Promise<{ url: string; mimeType: string }> {
    const response = await axiosInstance.get(`/receipts/${receiptId}/pdf`, {
      responseType: "blob"
    });
    const blob = response.data as Blob;
    return {
      url: toBlobObjectUrl(blob),
      mimeType: blob.type || "application/pdf"
    };
  },

  async findReceiptByPaymentId(paymentId: string): Promise<ReceiptRecord | null> {
    let page = 1;
    let totalPages = 1;

    while (page <= totalPages) {
      const response = await axiosInstance.get<ReceiptListResponse>("/receipts", {
        params: { page, limit: RECEIPT_LOOKUP_PAGE_SIZE }
      });

      const found = response.data.data.find((item) => item.paymentId === paymentId);
      if (found) return found;

      totalPages = response.data.meta.totalPages;
      page += 1;
    }

    return null;
  }
};
