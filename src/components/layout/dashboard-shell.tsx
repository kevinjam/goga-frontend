"use client";

import { DashboardNavbar } from "@/components/layout/dashboard-navbar";
import { DashboardSidebar } from "@/components/layout/dashboard-sidebar";
import { GogaFooter } from "@/components/branding/goga-footer";

export function DashboardShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen overflow-x-hidden bg-background text-foreground">
      <div className="grid min-h-screen md:grid-cols-[72px_1fr] lg:grid-cols-[260px_1fr]">
        <aside className="hidden border-r border-border bg-card md:block">
          <div className="sticky top-0 h-screen overflow-y-auto">
            <div className="hidden lg:block">
              <DashboardSidebar variant="full" />
            </div>
            <div className="lg:hidden">
              <DashboardSidebar variant="compact" />
            </div>
          </div>
        </aside>
        <div className="flex min-h-screen min-w-0 flex-col">
          <DashboardNavbar />
          <main className="flex-1 overflow-x-hidden p-4 md:p-6">{children}</main>
          <GogaFooter variant="compact" className="border-t border-border px-4" />
        </div>
      </div>
    </div>
  );
}
