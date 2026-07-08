import { getCopyrightText } from "@/config/branding";
import { cn } from "@/lib/utils";

export function GogaFooter({
  className,
  variant = "default"
}: {
  className?: string;
  variant?: "default" | "compact";
}) {
  return (
    <footer
      className={cn(
        "text-center text-xs text-muted-foreground",
        variant === "compact" ? "py-2" : "py-4",
        className
      )}
    >
      <p>{getCopyrightText()}</p>
    </footer>
  );
}
