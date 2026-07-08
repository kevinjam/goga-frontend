import { branding } from "@/config/branding";
import { GogaLogo } from "@/components/branding/goga-logo";
import { cn } from "@/lib/utils";

export function SidebarBrand({ compact = false }: { compact?: boolean }) {
  if (compact) {
    return (
      <div className="flex flex-col items-center gap-2 px-2 py-4">
        <GogaLogo size="sm" />
        <span className="text-center text-xs font-bold tracking-tight">GOGA</span>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-3 px-4 py-5">
      <GogaLogo size="sm" showBorder />
      <div className="min-w-0">
        <h1 className="truncate text-base font-bold tracking-tight">GOGA</h1>
        <p className={cn("truncate text-xs text-muted-foreground")}>
          {branding.organizationShort}
        </p>
      </div>
    </div>
  );
}
