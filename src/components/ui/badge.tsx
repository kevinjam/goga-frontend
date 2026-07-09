import { cn } from "@/lib/utils";

type BadgeVariant = "default" | "secondary" | "success" | "warning" | "danger";

const variantClasses: Record<BadgeVariant, string> = {
  default: "border-goga-crimson/20 bg-goga-crimson/5 text-goga-crimson",
  secondary: "border-neutral-150 bg-neutral-100 text-neutral-600 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-300",
  success: "border-green-150 bg-green-50 text-green-700",
  warning: "border-amber-150 bg-amber-50 text-amber-700",
  danger: "border-red-150 bg-red-50 text-red-700"
};

const dotClasses: Record<BadgeVariant, string> = {
  default: "bg-goga-crimson",
  secondary: "bg-neutral-400",
  success: "bg-green-600",
  warning: "bg-amber-500",
  danger: "bg-red-600"
};

export function Badge({
  className,
  variant = "default",
  showDot = false,
  children,
  ...props
}: React.ComponentProps<"span"> & { variant?: BadgeVariant; showDot?: boolean }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[9px] font-bold",
        variantClasses[variant],
        className
      )}
      {...props}
    >
      {showDot ? (
        <span className={cn("h-1.5 w-1.5 shrink-0 rounded-full", dotClasses[variant])} />
      ) : null}
      {children}
    </span>
  );
}
