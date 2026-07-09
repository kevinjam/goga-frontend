import { DashboardShell } from "@/components/layout/dashboard-shell";
import { PasswordChangeGuard } from "@/components/auth/password-change-guard";

export default function DashboardLayout({
  children
}: {
  children: React.ReactNode;
}) {
  return (
    <PasswordChangeGuard>
      <DashboardShell>{children}</DashboardShell>
    </PasswordChangeGuard>
  );
}
