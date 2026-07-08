import { branding } from "@/config/branding";
import { GogaLogo } from "@/components/branding/goga-logo";

export function AuthBranding({ priority = false }: { priority?: boolean }) {
  return (
    <div className="space-y-4 text-center">
      <GogaLogo size="lg" showBorder priority={priority} className="mx-auto" />
      <div className="space-y-1">
        <h1 className="text-lg font-semibold tracking-tight md:text-xl">
          {branding.applicationName}
        </h1>
        <p className="text-sm text-muted-foreground">{branding.loginSubtitle}</p>
      </div>
    </div>
  );
}

export function AuthPoweredByFooter() {
  return (
    <p className="text-center text-xs text-muted-foreground">
      {branding.footer.poweredByLabel}
      <br />
      <span className="font-medium text-foreground">{branding.organization}</span>
    </p>
  );
}
