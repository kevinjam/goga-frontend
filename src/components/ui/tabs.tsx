"use client";

import { cn } from "@/lib/utils";

export function Tabs({
  value,
  onValueChange,
  items,
  className
}: {
  value: string;
  onValueChange: (value: string) => void;
  items: { value: string; label: string }[];
  className?: string;
}) {
  return (
    <div className={cn("inline-flex flex-wrap gap-0.5 rounded-md bg-neutral-100 p-0.5", className)}>
      {items.map((item) => (
        <button
          key={item.value}
          type="button"
          onClick={() => onValueChange(item.value)}
          className={cn(
            "rounded-md px-3 py-1 text-xs font-semibold transition-all",
            value === item.value
              ? "bg-white text-goga-crimson shadow-xs"
              : "text-neutral-500 hover:text-neutral-800 dark:text-neutral-400 dark:hover:text-neutral-200"
          )}
        >
          {item.label}
        </button>
      ))}
    </div>
  );
}

export function TabPanel({
  value,
  activeValue,
  children,
  className
}: {
  value: string;
  activeValue: string;
  children: React.ReactNode;
  className?: string;
}) {
  if (value !== activeValue) {
    return null;
  }

  return <div className={cn("h-full min-h-0", className)}>{children}</div>;
}
