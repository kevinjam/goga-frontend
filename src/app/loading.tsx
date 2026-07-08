import { branding } from "@/config/branding";
import { GogaLogo } from "@/components/branding/goga-logo";

export default function Loading() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-4 p-6 text-center">
      <GogaLogo size="lg" showBorder priority />
      <div className="space-y-1">
        <p className="text-sm font-medium">Loading...</p>
        <p className="text-sm text-muted-foreground">{branding.organizationShort}</p>
      </div>
    </main>
  );
}
