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
    <div className={cn("flex flex-wrap gap-2 border-b border-border pb-2", className)}>
      {items.map((item) => (
        <button
          key={item.value}
          type="button"
          onClick={() => onValueChange(item.value)}
          className={cn(
            "rounded-md px-3 py-2 text-sm font-medium transition-colors",
            value === item.value
              ? "bg-primary text-primary-foreground"
              : "text-muted-foreground hover:bg-muted hover:text-foreground"
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
