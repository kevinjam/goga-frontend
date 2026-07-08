export type PaymentMethod = "BANK" | "MTN_MOMO" | "AIRTEL_MONEY" | "CASH";

export interface ReportFilters {
  startDate?: string;
  endDate?: string;
  paymentMethod?: PaymentMethod;
  member?: string;
  memberId?: string;
  receiptNumber?: string;
  page?: number;
  limit?: number;
}

export interface ReportRow {
  paymentDate: string;
  memberName: string | null;
  payerName: string | null;
  amount: number;
  paymentMethod: PaymentMethod;
  purpose: string | null;
  transactionReference: string;
  receiptNumber?: string | null;
}

export interface ReportSummary {
  totalPayments: number;
  totalAmount: number;
  matchedPayments: number;
  unmatchedPayments: number;
}

export interface ReportResult {
  summary: ReportSummary;
  rows: ReportRow[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}
