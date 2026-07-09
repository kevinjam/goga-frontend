import { Minus, TrendingDown, TrendingUp } from "lucide-react";
import { cn } from "@/lib/utils";
import type { KpiMetric } from "@/types/dashboard";

const iconToneMap: Record<string, string> = {
  receipts: "bg-goga-crimson/5 border-goga-crimson/10 text-goga-crimson",
  revenue: "bg-goga-crimson/5 border-goga-crimson/10 text-goga-crimson",
  members: "bg-indigo-50 border-indigo-100 text-indigo-700",
  default: "bg-amber-50 border-amber-100 text-amber-700"
};

function iconTone(id: string) {
  if (id.includes("receipt")) return iconToneMap.receipts;
  if (id.includes("revenue")) return iconToneMap.revenue;
  if (id.includes("member")) return iconToneMap.members;
  return iconToneMap.default;
}

export function MetricCard({ metric }: { metric: KpiMetric }) {
  const Icon = metric.icon;
  const trendIsUp = metric.trend === "up";
  const trendIsDown = metric.trend === "down";
  const trendIsNeutral = metric.trend === "neutral";
  const hasGrowth = Boolean(metric.growth && metric.growth.trim().length > 0);

  return (
    <div className="flex items-center gap-4 rounded-lg border border-neutral-200 bg-white p-5 shadow-xs transition-all hover:border-goga-crimson/30 dark:border-neutral-800 dark:bg-neutral-900">
      <div
        className={cn(
          "flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border",
          iconTone(metric.id)
        )}
      >
        <Icon className="h-5 w-5" />
      </div>
      <div className="min-w-0">
        <p className="text-[10px] font-bold uppercase tracking-wider text-neutral-400">
          {metric.title}
        </p>
        <p className="font-mono text-xl font-extrabold text-neutral-800 dark:text-neutral-100">
          {metric.value}
        </p>
        {hasGrowth ? (
          <p
            className={cn(
              "mt-0.5 flex items-center gap-0.5 text-[10px] font-semibold",
              trendIsNeutral
                ? "text-neutral-400"
                : trendIsUp
                  ? "text-green-600"
                  : trendIsDown
                    ? "text-amber-600"
                    : "text-neutral-400"
            )}
          >
            {trendIsNeutral ? (
              <Minus className="h-3 w-3" />
            ) : trendIsUp ? (
              <TrendingUp className="h-3 w-3" />
            ) : (
              <TrendingDown className="h-3 w-3" />
            )}
            {metric.growth} vs last period
          </p>
        ) : null}
      </div>
    </div>
  );
}
