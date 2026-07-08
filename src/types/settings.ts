import type { UserRole } from "@/types/auth";

export interface SettingsUser {
  id: string;
  email: string;
  role: UserRole;
  isActive?: boolean;
}

export type EmailDeliveryStatus = "PENDING" | "SENT" | "FAILED";

export interface EmailLogItem {
  id: string;
  receiptId: string;
  receiptNumber: string;
  recipient: string | null;
  recipientName: string | null;
  subject: string;
  status: EmailDeliveryStatus;
  sentAt: string | null;
  pdfUrl: string | null;
}

export interface PaginatedMeta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface PaginatedEmailLogsResponse {
  data: EmailLogItem[];
  meta: PaginatedMeta;
}

