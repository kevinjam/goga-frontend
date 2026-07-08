export interface ParsedPaymentRow {
  rowNumber: number;
  date: string;
  receivedFrom: string;
  amount: number;
  method: string;
  purpose: string;
  transactionReference: string | null;
  isValid: boolean;
}

export interface RowValidationError {
  rowNumber: number;
  errors: string[];
}

export interface ImportPaymentResult {
  rowNumber: number;
  status: "IMPORTED" | "DUPLICATE" | "INVALID" | "FAILED";
  paymentId?: string;
  memberId?: string | null;
  transactionReference?: string;
  errors?: string[];
}

export interface ImportSummary {
  totalRows: number;
  imported: number;
  duplicates: number;
  invalid: number;
  matched: number;
  needsReview: number;
  failed: number;
  receiptsGenerated: number;
  emailsSent: number;
  emailFailures: number;
}

export interface ImportPaymentsResponse {
  uploadHistoryId: string;
  fileName: string;
  summary: ImportSummary;
  results: ImportPaymentResult[];
}

export interface ImportPaymentsRequest {
  fileName: string;
  sheetName?: string;
  rows: ParsedPaymentRow[];
}
