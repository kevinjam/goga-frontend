import type { PaymentRecord } from "@/types/payments";

export interface ReceiptRecord {
  id: string;
  receiptNumber: string;
  paymentId: string;
  pdfUrl: string | null;
  emailStatus: "PENDING" | "SENT" | "FAILED";
  emailSentAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface ReceiptsMeta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface ReceiptsResponse {
  data: ReceiptRecord[];
  meta: ReceiptsMeta;
}

export interface ReceiptsQueryParams {
  page: number;
  limit: number;
  search?: string;
}

export type ReceiptSource = "Email" | "Manual Upload" | "WhatsApp";

export interface EnrichedReceiptRecord extends ReceiptRecord {
  payment: PaymentRecord | null;
  source: ReceiptSource;
}
