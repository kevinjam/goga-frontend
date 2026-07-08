import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export function MobileDataCard({
  className,
  onClick,
  children
}: {
  className?: string;
  onClick?: () => void;
  children: ReactNode;
}) {
  return (
    <div
      role={onClick ? "button" : undefined}
      tabIndex={onClick ? 0 : undefined}
      onClick={onClick}
      onKeyDown={
        onClick
          ? (event) => {
              if (event.key === "Enter" || event.key === " ") {
                event.preventDefault();
                onClick();
              }
            }
          : undefined
      }
      className={cn(
        "rounded-lg border border-border bg-card p-4 shadow-sm",
        onClick && "cursor-pointer transition-colors hover:bg-muted/40",
        className
      )}
    >
      {children}
    </div>
  );
}

export function MobileDataCardField({
  label,
  value,
  className
}: {
  label: string;
  value: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("min-w-0", className)}>
      <p className="text-xs uppercase tracking-wide text-muted-foreground">{label}</p>
      <div className="truncate text-sm font-medium">{value}</div>
    </div>
  );
}
