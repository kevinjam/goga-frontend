import { cn } from "@/lib/utils";

type Variant = "default" | "outline" | "ghost" | "danger";
type Size = "default" | "sm" | "icon";

const variantClassMap: Record<Variant, string> = {
  default: "bg-primary text-primary-foreground hover:opacity-90",
  outline: "border border-border bg-transparent hover:bg-muted",
  ghost: "hover:bg-muted",
  danger: "bg-danger text-white hover:opacity-90"
};

const sizeClassMap: Record<Size, string> = {
  default: "h-10 px-4 py-2",
  sm: "h-9 px-3 text-xs",
  icon: "h-9 w-9 p-0"
};

export function buttonVariants({
  variant = "default",
  size = "default",
  className
}: {
  variant?: Variant;
  size?: Size;
  className?: string;
}) {
  return cn(
    "inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors disabled:opacity-50 disabled:pointer-events-none",
    variantClassMap[variant],
    sizeClassMap[size],
    className
  );
}

export type ButtonVariant = Variant;
export type ButtonSize = Size;
