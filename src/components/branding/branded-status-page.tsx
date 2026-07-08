import Link from "next/link";
import { branding } from "@/config/branding";
import { GogaLogo } from "@/components/branding/goga-logo";
import { GogaFooter } from "@/components/branding/goga-footer";
import { Button } from "@/components/ui/button";
import { buttonVariants } from "@/components/ui/button-variants";
import { cn } from "@/lib/utils";

interface BrandedStatusPageProps {
  title: string;
  description: string;
  actionLabel?: string;
  actionHref?: string;
  onRetry?: () => void;
  className?: string;
}

export function BrandedStatusPage({
  title,
  description,
  actionLabel = "Go to Dashboard",
  actionHref = "/dashboard",
  onRetry,
  className
}: BrandedStatusPageProps) {
  return (
    <main
      className={cn(
        "mx-auto flex min-h-screen w-full max-w-lg flex-col items-center justify-center gap-6 p-6 text-center",
        className
      )}
    >
      <GogaLogo size="lg" showBorder priority />
      <div className="space-y-2">
        <p className="text-sm font-medium text-muted-foreground">
          {branding.organization}
        </p>
        <h1 className="text-2xl font-semibold">{title}</h1>
        <p className="text-sm text-muted-foreground">{description}</p>
      </div>
      <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row">
        {actionHref ? (
          <Link
            href={actionHref}
            className={cn(buttonVariants({}), "min-h-10 w-full sm:w-auto")}
          >
            {actionLabel}
          </Link>
        ) : null}
        {onRetry ? (
          <Button
            type="button"
            variant="outline"
            className="min-h-10 w-full sm:w-auto"
            onClick={onRetry}
          >
            Try again
          </Button>
        ) : null}
      </div>
      <GogaFooter variant="compact" className="w-full" />
    </main>
  );
}
