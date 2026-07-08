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
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
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
    <aside className="flex h-full w-full flex-col">
      <div className="border-b border-border">
        <SidebarBrand compact={isCompact} />
      </div>

      <nav className={cn("flex-1 space-y-1", isCompact ? "p-2" : "p-3")}>
        {navItems.map((item) => {
          const isActive =
            pathname === item.href || pathname.startsWith(`${item.href}/`);
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onNavigate}
              title={isCompact ? item.label : undefined}
              aria-label={isCompact ? item.label : undefined}
              className={cn(
                "flex items-center rounded-md text-sm transition-colors",
                isCompact ? "justify-center px-2 py-2.5" : "gap-3 px-3 py-2",
                isActive
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              )}
            >
              <Icon className="h-4 w-4 shrink-0" />
              {!isCompact ? item.label : null}
            </Link>
          );
        })}
      </nav>

      <div className={cn("border-t border-border", isCompact ? "p-2" : "p-4")}>
        <div className={cn("flex items-center", isCompact ? "justify-center" : "gap-3")}>
          <Avatar>
            <AvatarFallback>
              {user?.name?.slice(0, 2).toUpperCase() ?? "GU"}
            </AvatarFallback>
          </Avatar>
          {!isCompact ? (
            <div className="min-w-0">
              <p className="truncate text-sm font-medium">{user?.name ?? "Guest User"}</p>
              <p className="truncate text-xs text-muted-foreground">
                {user?.role ?? "N/A"}
              </p>
            </div>
          ) : null}
        </div>
      </div>
    </aside>
  );
}
