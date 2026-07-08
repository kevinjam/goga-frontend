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
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { DashboardSidebar } from "@/components/layout/dashboard-sidebar";
import { ThemeToggle } from "@/components/layout/theme-toggle";
import { useAuth } from "@/context/AuthContext";

function pathToTitle(pathname: string): string {
  if (pathname === "/dashboard") return "Dashboard";
  const last = pathname.split("/").filter(Boolean).pop() ?? "Dashboard";
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
    <header className="sticky top-0 z-20 flex h-14 min-h-14 items-center justify-between gap-2 border-b border-border bg-background/90 px-3 backdrop-blur sm:h-16 sm:px-4 md:px-6">
      <div className="flex min-w-0 flex-1 items-center gap-2 sm:gap-3">
        <div className="md:hidden">
          <Sheet open={mobileNavOpen} onOpenChange={setMobileNavOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" className="h-10 w-10 shrink-0 p-0">
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
          <p className="truncate text-xs text-muted-foreground">
            {breadcrumbs.join(" / ")}
          </p>
          <h2 className="truncate text-sm font-semibold md:text-base">
            {pathToTitle(pathname)}
          </h2>
        </div>
      </div>

      <div className="flex shrink-0 items-center gap-1 sm:gap-2 md:gap-3">
        <div className="relative hidden w-56 md:block">
          <Search className="pointer-events-none absolute left-2 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search..."
            className="h-9 pl-8"
            aria-label="Global search"
          />
        </div>
        <Button
          variant="ghost"
          className="h-10 w-10 p-0 md:hidden"
          onClick={() => setMobileSearchOpen((open) => !open)}
          aria-expanded={mobileSearchOpen}
          aria-label="Toggle search"
        >
          <Search className="h-4 w-4" />
        </Button>
        <Button variant="ghost" className="h-10 w-10 p-0">
          <Bell className="h-4 w-4" />
          <span className="sr-only">Notifications</span>
        </Button>
        <ThemeToggle />
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-10 w-10 rounded-full p-0">
              <Avatar>
                <AvatarFallback>
                  {user?.name?.slice(0, 2).toUpperCase() ?? "GU"}
                </AvatarFallback>
              </Avatar>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel className="max-w-[240px] truncate">
              {user?.email ?? "User"}
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={logout}>Logout</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {mobileSearchOpen ? (
        <div className="absolute inset-x-0 top-full border-b border-border bg-background p-3 md:hidden">
          <div className="relative">
            <Search className="pointer-events-none absolute left-2 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search..."
              className="h-10 w-full pl-8"
              aria-label="Global search"
              autoFocus
            />
          </div>
        </div>
      ) : null}
    </header>
  );
}
