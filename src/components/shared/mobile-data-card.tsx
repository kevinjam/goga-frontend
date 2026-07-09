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
        "rounded-lg border border-neutral-200 bg-white p-4 shadow-xs dark:border-neutral-800 dark:bg-neutral-900",
        onClick && "cursor-pointer transition-all hover:border-goga-crimson/30 hover:shadow-md",
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
      <p className="text-[10px] font-bold uppercase tracking-wider text-neutral-400">{label}</p>
      <div className="truncate text-xs font-semibold text-neutral-800 dark:text-neutral-100">{value}</div>
    </div>
  );
}
