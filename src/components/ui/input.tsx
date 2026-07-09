import * as React from "react";
import { cn } from "@/lib/utils";

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, ...props }, ref) => (
    <input
      ref={ref}
      className={cn(
        "flex h-9 w-full rounded-lg border border-neutral-200 bg-white px-3 py-2 text-xs text-neutral-700 placeholder:text-neutral-400 focus-visible:border-goga-crimson focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-goga-crimson disabled:cursor-not-allowed disabled:opacity-50 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-200",
        className
      )}
      {...props}
    />
  )
);

Input.displayName = "Input";
