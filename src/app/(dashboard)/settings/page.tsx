"use client";

import { useCallback, useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { settingsService } from "@/services/api/settingsService";
import type { SettingsUser } from "@/types/settings";
import { AuditSettingsTab } from "@/features/settings/audit-settings-tab";
import { EmailLogsSettingsTab } from "@/features/settings/email-logs-settings-tab";
import { SecuritySettingsTab } from "@/features/settings/security-settings-tab";
import { UsersSettingsTab } from "@/features/settings/users-settings-tab";
import { Alert, AlertDescription, AlertTitle, TabPanel, Tabs } from "@/components/ui";

const TAB_ITEMS = [
  { value: "users", label: "Users" },
  { value: "audit", label: "Audit Log" },
  { value: "security", label: "Security" },
  { value: "emails", label: "Receipt Emails" }
] as const;

type SettingsTab = (typeof TAB_ITEMS)[number]["value"];

export default function SettingsPage() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<SettingsTab>("users");
  const [users, setUsers] = useState<SettingsUser[]>([]);
  const [isUsersLoading, setIsUsersLoading] = useState(true);
  const isSuperAdmin = user?.role === "ADMIN";

  const loadUsers = useCallback(async (signal?: AbortSignal) => {
    setIsUsersLoading(true);
    try {
      const rows = await settingsService.getUsers(signal);
      if (signal?.aborted) return;
      setUsers(rows);
    } finally {
      if (signal?.aborted) return;
      setIsUsersLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!isSuperAdmin) return;
    const controller = new AbortController();
    void loadUsers(controller.signal);
    return () => controller.abort();
  }, [isSuperAdmin, loadUsers]);

  if (!isSuperAdmin) {
    return (
      <Alert>
        <AlertTitle>Restricted Access</AlertTitle>
        <AlertDescription>
          Only Super Admin (ADMIN role) can access administrative settings.
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <section className="flex h-[calc(100dvh-8.5rem)] flex-col overflow-hidden">
      <div className="shrink-0">
        <h1 className="text-xl font-semibold tracking-tight">Settings</h1>
        <p className="text-sm text-muted-foreground">
          User management, audit trail, security, and email delivery.
        </p>
      </div>

      <Tabs
        className="mt-4 shrink-0"
        value={activeTab}
        onValueChange={(value) => setActiveTab(value as SettingsTab)}
        items={[...TAB_ITEMS]}
      />

      <div className="mt-4 min-h-0 flex-1 overflow-hidden">
        <TabPanel value="users" activeValue={activeTab} className="h-full">
          <UsersSettingsTab
            users={users}
            isLoading={isUsersLoading}
            onRefresh={() => loadUsers()}
          />
        </TabPanel>
        <TabPanel value="audit" activeValue={activeTab} className="h-full">
          <AuditSettingsTab />
        </TabPanel>
        <TabPanel value="security" activeValue={activeTab} className="h-full">
          <SecuritySettingsTab />
        </TabPanel>
        <TabPanel value="emails" activeValue={activeTab} className="h-full">
          <EmailLogsSettingsTab />
        </TabPanel>
      </div>
    </section>
  );
}
