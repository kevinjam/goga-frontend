import type { UserRole } from "@/types/auth";

export interface SettingsUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  isActive?: boolean;
  mustChangePassword?: boolean;
  tempPasswordExpiresAt?: string | null;
  lastWelcomeEmailStatus?: "SENT" | "FAILED" | "RESENT" | null;
  lastWelcomeEmailAt?: string | null;
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

export type AuditAction =
  | "ADMIN_USER_CREATED"
  | "WELCOME_EMAIL_SENT"
  | "WELCOME_EMAIL_FAILED"
  | "WELCOME_EMAIL_RESENT"
  | "PASSWORD_CHANGED"
  | "USER_DEACTIVATED"
  | "USER_ACTIVATED"
  | "PASSWORD_RESET_REQUESTED";

export interface AuditLogItem {
  id: string;
  action: AuditAction;
  actorId: string | null;
  actorName: string | null;
  actorEmail: string | null;
  targetId: string | null;
  targetName: string | null;
  targetEmail: string | null;
  metadata: Record<string, unknown> | null;
  createdAt: string;
}

export interface SecuritySettings {
  invitationExpiryHours: number;
  forgotPasswordEnabled: boolean;
  invitationExpiryEnabled: boolean;
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

export interface PaginatedAuditLogsResponse {
  data: AuditLogItem[];
  meta: PaginatedMeta;
}

export interface ResendWelcomeEmailResponse {
  emailSent: boolean;
  message: string;
}
