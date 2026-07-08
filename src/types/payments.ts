export type PaymentStatus =
  | "PENDING"
  | "NEEDS_REVIEW"
  | "MATCHED"
  | "RECEIPTED"
  | "FAILED";

export interface PaymentRecord {
  id: string;
  memberId: string | null;
  uploadHistoryId: string | null;
  receivedFrom: string | null;
  date: string;
  amount: number;
  method: string;
  purpose: string | null;
  transactionReference: string;
  status: PaymentStatus;
  createdAt: string;
  updatedAt: string;
}

export interface PaymentsMeta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface PaymentsResponse {
  data: PaymentRecord[];
  meta: PaymentsMeta;
}

export interface PaymentQueryParams {
  page: number;
  limit: number;
  search?: string;
  status?: PaymentStatus;
  dateRange?: "7d" | "30d" | "90d" | "all";
  amountBracket?: "all" | "lt100k" | "100k-1m" | "gt1m";
}

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

export interface ReceiptListResponse {
  data: ReceiptRecord[];
  meta: PaymentsMeta;
}
