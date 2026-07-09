import { cn } from "@/lib/utils";

type Variant = "default" | "outline" | "ghost" | "danger";
type Size = "default" | "sm" | "icon";

const variantClassMap: Record<Variant, string> = {
  default:
    "bg-goga-crimson text-white shadow-sm hover:bg-goga-crimson-hover active:scale-[0.98]",
  outline:
    "border border-neutral-200 bg-white text-neutral-700 hover:bg-neutral-50 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-200 dark:hover:bg-neutral-800",
  ghost:
    "text-neutral-500 hover:bg-neutral-100 hover:text-neutral-800 dark:text-neutral-400 dark:hover:bg-neutral-800 dark:hover:text-neutral-200",
  danger: "bg-danger text-white shadow-sm hover:opacity-90"
};

const sizeClassMap: Record<Size, string> = {
  default: "h-9 px-4 py-2",
  sm: "h-8 px-3",
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
    "inline-flex items-center justify-center gap-2 rounded text-xs font-bold transition-all disabled:pointer-events-none disabled:opacity-50",
    variantClassMap[variant],
    sizeClassMap[size],
    className
  );
}

export type ButtonVariant = Variant;
export type ButtonSize = Size;
