export const LOGIN_EMAIL_STORAGE_KEY = "goga_login_email";
export const LOGIN_CODE_SENT_AT_KEY = "goga_code_sent_at";
export const RESEND_COOLDOWN_SECONDS = 60;

export function storeLoginChallenge(email: string): void {
  if (typeof window === "undefined") return;
  sessionStorage.setItem(LOGIN_EMAIL_STORAGE_KEY, email);
  sessionStorage.setItem(LOGIN_CODE_SENT_AT_KEY, String(Date.now()));
}

export function getStoredLoginEmail(): string | null {
  if (typeof window === "undefined") return null;
  return sessionStorage.getItem(LOGIN_EMAIL_STORAGE_KEY);
}

export function getResendCooldownRemaining(): number {
  if (typeof window === "undefined") return 0;

  const sentAtRaw = sessionStorage.getItem(LOGIN_CODE_SENT_AT_KEY);
  if (!sentAtRaw) return 0;

  const sentAt = Number(sentAtRaw);
  if (!Number.isFinite(sentAt)) return 0;

  const elapsedSeconds = Math.floor((Date.now() - sentAt) / 1000);
  return Math.max(0, RESEND_COOLDOWN_SECONDS - elapsedSeconds);
}

export function markCodeResent(): void {
  if (typeof window === "undefined") return;
  sessionStorage.setItem(LOGIN_CODE_SENT_AT_KEY, String(Date.now()));
}

export function clearLoginChallenge(): void {
  if (typeof window === "undefined") return;
  sessionStorage.removeItem(LOGIN_EMAIL_STORAGE_KEY);
  sessionStorage.removeItem(LOGIN_CODE_SENT_AT_KEY);
}
