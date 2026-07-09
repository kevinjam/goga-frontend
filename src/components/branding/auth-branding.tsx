import { branding } from "@/config/branding";
import { GogaLogo } from "@/components/branding/goga-logo";

export function AuthBranding({ priority = false }: { priority?: boolean }) {
  return (
    <div className="space-y-4 text-center">
      <GogaLogo size="lg" showBorder priority={priority} className="mx-auto" />
      <div className="space-y-1">
        <h1 className="font-display text-lg font-black tracking-tight text-neutral-900 md:text-xl dark:text-white">
          {branding.applicationName}
        </h1>
        <p className="text-[10px] font-bold uppercase tracking-widest text-goga-gray-muted">
          {branding.loginSubtitle}
        </p>
      </div>
    </div>
  );
}

export function AuthPoweredByFooter() {
  return (
    <p className="text-center text-[10px] text-neutral-400">
      {branding.footer.poweredByLabel}
      <br />
      <span className="font-semibold text-neutral-600 dark:text-neutral-300">
        {branding.organization}
      </span>
    </p>
  );
}
