import axiosInstance from "@/services/api/axiosInstance";
import { paymentsService } from "@/services/api/paymentsService";
import type {
  EnrichedReceiptRecord,
  ReceiptsQueryParams,
  ReceiptsResponse
} from "@/types/receipts";

const PAYMENT_CACHE_TTL_MS = 2 * 60 * 1000;
const PAYMENT_CACHE_MAX_ITEMS = 300;

type CachedPaymentEntry = {
  payment: Awaited<ReturnType<typeof paymentsService.getPaymentById>> | null;
  expiresAt: number;
};

const paymentByIdCache = new Map<string, CachedPaymentEntry>();
const paymentByIdInFlight = new Map<
  string,
  Promise<Awaited<ReturnType<typeof paymentsService.getPaymentById>> | null>
>();

function trimPaymentCacheIfNeeded() {
  if (paymentByIdCache.size <= PAYMENT_CACHE_MAX_ITEMS) return;

  const oldestKey = paymentByIdCache.keys().next().value as string | undefined;
  if (oldestKey) {
    paymentByIdCache.delete(oldestKey);
  }
}

function getCachedPayment(paymentId: string) {
  const cached = paymentByIdCache.get(paymentId);
  if (!cached) return null;
  if (Date.now() >= cached.expiresAt) {
    paymentByIdCache.delete(paymentId);
    return null;
  }
  return cached.payment;
}

function setCachedPayment(
  paymentId: string,
  payment: Awaited<ReturnType<typeof paymentsService.getPaymentById>> | null
) {
  paymentByIdCache.set(paymentId, {
    payment,
    expiresAt: Date.now() + PAYMENT_CACHE_TTL_MS
  });
  trimPaymentCacheIfNeeded();
}

async function getPaymentByIdCached(paymentId: string) {
  const cached = getCachedPayment(paymentId);
  if (cached) return cached;

  const inflight = paymentByIdInFlight.get(paymentId);
  if (inflight) return inflight;

  const request = paymentsService
    .getPaymentById(paymentId)
    .then((payment) => {
      setCachedPayment(paymentId, payment);
      return payment;
    })
    .catch(() => {
      setCachedPayment(paymentId, null);
      return null;
    })
    .finally(() => {
      paymentByIdInFlight.delete(paymentId);
    });

  paymentByIdInFlight.set(paymentId, request);
  return request;
}

function triggerBlobDownload(blob: Blob, fileName: string): void {
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

function resolveSource(uploadHistoryId: string | null | undefined) {
  if (uploadHistoryId) return "Manual Upload" as const;
  return "Email" as const;
}

export const receiptsService = {
  async getReceipts(
    params: ReceiptsQueryParams,
    signal?: AbortSignal
  ): Promise<ReceiptsResponse> {
    const response = await axiosInstance.get<ReceiptsResponse>("/receipts", {
      params: {
        page: params.page,
        limit: params.limit
      },
      signal
    });
    return response.data;
  },

  async getEnrichedReceipts(params: ReceiptsQueryParams, signal?: AbortSignal): Promise<{
    data: EnrichedReceiptRecord[];
    meta: ReceiptsResponse["meta"];
  }> {
    const base = await this.getReceipts(params, signal);
    const uniquePaymentIds = Array.from(new Set(base.data.map((receipt) => receipt.paymentId)));
    const paymentEntries = await Promise.all(
      uniquePaymentIds.map(async (paymentId) => [paymentId, await getPaymentByIdCached(paymentId)] as const)
    );
    const paymentsById = new Map(paymentEntries);

    const data: EnrichedReceiptRecord[] = base.data.map((receipt) => ({
      ...receipt,
      payment: paymentsById.get(receipt.paymentId) ?? null,
      source: resolveSource(paymentsById.get(receipt.paymentId)?.uploadHistoryId)
    }));

    return { data, meta: base.meta };
  },

  async downloadReceiptPdf(id: string): Promise<void> {
    const response = await axiosInstance.get(`/receipts/${id}/pdf`, {
      responseType: "blob"
    });
    triggerBlobDownload(response.data as Blob, `receipt-${id}.pdf`);
  },

  async resendReceiptEmail(id: string): Promise<void> {
    await axiosInstance.post(`/email/logs/${id}/resend`);
  },

  async getReceiptPreviewAsset(id: string): Promise<{ url: string; mimeType: string }> {
    const response = await axiosInstance.get(`/receipts/${id}/pdf`, {
      responseType: "blob"
    });
    const blob = response.data as Blob;
    return {
      url: URL.createObjectURL(blob),
      mimeType: blob.type || "application/pdf"
    };
  },

  clearPaymentCache() {
    paymentByIdCache.clear();
    paymentByIdInFlight.clear();
  }
};
