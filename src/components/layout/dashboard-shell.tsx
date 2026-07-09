"use client";

import { DashboardNavbar } from "@/components/layout/dashboard-navbar";
import { DashboardSidebar } from "@/components/layout/dashboard-sidebar";

export function DashboardShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen overflow-x-hidden bg-neutral-50 font-sans text-neutral-800 antialiased dark:bg-neutral-950 dark:text-neutral-100">
      <div className="flex min-h-screen">
        <aside className="fixed bottom-0 left-0 top-0 z-30 hidden w-[260px] border-r border-neutral-200 bg-white dark:border-neutral-800 dark:bg-neutral-900 md:flex">
          <DashboardSidebar variant="full" />
        </aside>

        <div className="flex min-h-screen min-w-0 flex-1 flex-col md:ml-[260px]">
          <DashboardNavbar />
          <main className="mx-auto w-full max-w-7xl flex-1 overflow-x-hidden p-6 md:p-8">
            {children}
          </main>
        </div>
      </div>
    </div>
  );
}
