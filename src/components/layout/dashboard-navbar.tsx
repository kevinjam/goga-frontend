"use client";

import { Bell, Menu, Search } from "lucide-react";
import { useMemo, useState } from "react";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { DashboardSidebar } from "@/components/layout/dashboard-sidebar";
import { ThemeToggle } from "@/components/layout/theme-toggle";
import { useAuth } from "@/context/AuthContext";

function pathToTitle(pathname: string): string {
  if (pathname === "/dashboard") return "Dashboard";
  if (pathname === "/settings") return "Settings";
  const last = pathname.split("/").filter(Boolean).pop() ?? "Dashboard";
  if (last === "upload") return "Upload Payments";
  return last.charAt(0).toUpperCase() + last.slice(1);
}

export function DashboardNavbar() {
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);

  const breadcrumbs = useMemo(
    () => ["Dashboard", pathToTitle(pathname)],
    [pathname]
  );

  return (
    <header className="sticky top-0 z-20 flex h-16 min-h-16 items-center justify-between gap-2 border-b border-neutral-200 bg-neutral-50/80 px-4 backdrop-blur-md dark:border-neutral-800 dark:bg-neutral-950/80 md:px-6">
      <div className="flex min-w-0 flex-1 items-center gap-2 sm:gap-3">
        <div className="md:hidden">
          <Sheet open={mobileNavOpen} onOpenChange={setMobileNavOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" className="h-9 w-9 shrink-0 p-0">
                <Menu className="h-5 w-5" />
                <span className="sr-only">Open navigation</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-[min(100vw,280px)] max-w-[280px] p-0">
              <DashboardSidebar
                variant="full"
                onNavigate={() => setMobileNavOpen(false)}
              />
            </SheetContent>
          </Sheet>
        </div>
        <div className="min-w-0">
          <p className="truncate text-[10px] font-bold uppercase tracking-wider text-neutral-400">
            {breadcrumbs.join(" / ")}
          </p>
          <h2 className="font-display truncate text-sm font-black tracking-tight text-neutral-900 dark:text-white">
            {pathToTitle(pathname)}
          </h2>
        </div>
      </div>

      <div className="flex shrink-0 items-center gap-1 sm:gap-2">
        <div className="relative hidden w-56 md:block">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-neutral-400" />
          <Input
            placeholder="Search..."
            className="h-9 rounded-lg border-neutral-200 bg-white pl-8 text-xs"
            aria-label="Global search"
          />
        </div>
        <Button
          variant="ghost"
          className="h-9 w-9 rounded-lg p-0 hover:bg-neutral-100 hover:text-goga-crimson md:hidden"
          onClick={() => setMobileSearchOpen((open) => !open)}
          aria-expanded={mobileSearchOpen}
          aria-label="Toggle search"
        >
          <Search className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          className="relative h-9 w-9 rounded-lg p-0 hover:bg-neutral-100 hover:text-goga-crimson"
        >
          <Bell className="h-4 w-4" />
          <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-goga-crimson" />
          <span className="sr-only">Notifications</span>
        </Button>
        <ThemeToggle />
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              className="h-9 w-9 rounded-full p-0 hover:bg-neutral-100"
            >
              <div className="flex h-8 w-8 items-center justify-center rounded-full border border-goga-crimson/20 bg-goga-crimson/10 text-xs font-bold text-goga-crimson">
                {user?.name?.slice(0, 2).toUpperCase() ?? "GU"}
              </div>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="border-neutral-200 bg-white dark:border-neutral-800 dark:bg-neutral-900">
            <DropdownMenuLabel className="max-w-[240px] truncate text-xs">
              {user?.email ?? "User"}
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="text-xs" onClick={logout}>
              Logout
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {mobileSearchOpen ? (
        <div className="absolute inset-x-0 top-full border-b border-neutral-200 bg-white p-3 dark:border-neutral-800 dark:bg-neutral-900 md:hidden">
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-neutral-400" />
            <Input
              placeholder="Search..."
              className="h-10 w-full rounded-lg pl-8 text-xs"
              aria-label="Global search"
              autoFocus
            />
          </div>
        </div>
      ) : null}
    </header>
  );
}
