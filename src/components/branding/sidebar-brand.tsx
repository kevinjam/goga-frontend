import { branding } from "@/config/branding";
import { GogaLogo } from "@/components/branding/goga-logo";
import { cn } from "@/lib/utils";

export function SidebarBrand({ compact = false }: { compact?: boolean }) {
  if (compact) {
    return (
      <div className="flex flex-col items-center gap-2 px-2">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-goga-crimson font-display text-xl font-extrabold text-white shadow-sm">
          G
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-3 px-3">
      <GogaLogo size="sm" showBorder className="rounded-lg" />
      <div className="min-w-0">
        <h1 className="font-display text-base font-black leading-none tracking-tight text-neutral-900 dark:text-white">
          GOGA
        </h1>
        <span className="text-[9px] font-bold uppercase tracking-widest text-goga-gray-muted dark:text-neutral-400">
          {branding.organizationShort}
        </span>
      </div>
    </div>
  );
}
