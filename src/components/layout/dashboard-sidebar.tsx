"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  CreditCard,
  LayoutDashboard,
  LineChart,
  Users,
  ReceiptText,
  Settings
} from "lucide-react";
import { cn } from "@/lib/utils";
import { SidebarBrand } from "@/components/branding/sidebar-brand";
import { useAuth } from "@/context/AuthContext";

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/dashboard/members", label: "Members", icon: Users },
  { href: "/dashboard/payments", label: "Payments", icon: CreditCard },
  { href: "/dashboard/receipts", label: "Receipts", icon: ReceiptText },
  { href: "/dashboard/reports", label: "Reports", icon: LineChart },
  { href: "/settings", label: "Settings", icon: Settings }
] as const;

export function DashboardSidebar({
  onNavigate,
  variant = "full"
}: {
  onNavigate?: () => void;
  variant?: "full" | "compact";
}) {
  const pathname = usePathname();
  const { user } = useAuth();
  const isCompact = variant === "compact";

  return (
    <aside className="flex h-full w-full flex-col justify-between py-6 px-4">
      <div className="space-y-8">
        <SidebarBrand compact={isCompact} />

        <nav className="space-y-1">
          {navItems.map((item) => {
            const isActive =
              item.href === "/dashboard"
                ? pathname === "/dashboard"
                : pathname === item.href || pathname.startsWith(`${item.href}/`);
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={onNavigate}
                title={isCompact ? item.label : undefined}
                aria-label={isCompact ? item.label : undefined}
                className={cn(
                  "flex w-full items-center rounded-lg text-left text-xs font-semibold transition-all",
                  isCompact ? "justify-center px-2 py-2.5" : "gap-3 px-3.5 py-2.5",
                  isActive
                    ? "scale-[0.98] bg-goga-crimson text-white shadow-sm font-bold"
                    : "text-neutral-500 hover:bg-neutral-100 hover:text-neutral-800 dark:text-neutral-400 dark:hover:bg-neutral-800 dark:hover:text-neutral-200"
                )}
              >
                <Icon className="h-4 w-4 shrink-0" />
                {!isCompact ? item.label : null}
              </Link>
            );
          })}
        </nav>
      </div>

      {!isCompact ? (
        <div className="border-t border-neutral-200 pt-4 dark:border-neutral-800">
          <div className="flex items-center gap-3 px-1">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-goga-crimson/20 bg-goga-crimson/10 text-xs font-bold text-goga-crimson">
              {user?.name?.slice(0, 2).toUpperCase() ?? "GU"}
            </div>
            <div className="min-w-0">
              <p className="truncate text-xs font-semibold text-neutral-800 dark:text-neutral-100">
                {user?.name ?? "Guest User"}
              </p>
              <p className="truncate text-[10px] text-neutral-400">{user?.role ?? "N/A"}</p>
            </div>
          </div>
        </div>
      ) : null}
    </aside>
  );
}
