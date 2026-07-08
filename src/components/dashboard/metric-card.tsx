import { Minus, TrendingDown, TrendingUp } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import type { KpiMetric } from "@/types/dashboard";

export function MetricCard({ metric }: { metric: KpiMetric }) {
  const Icon = metric.icon;
  const trendIsUp = metric.trend === "up";
  const trendIsDown = metric.trend === "down";
  const trendIsNeutral = metric.trend === "neutral";
  const hasGrowth = Boolean(metric.growth && metric.growth.trim().length > 0);

  return (
    <Card>
      <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
        <div>
          <CardDescription>{metric.title}</CardDescription>
          <CardTitle className="mt-2 text-xl md:text-2xl">{metric.value}</CardTitle>
        </div>
        <div className="rounded-md border border-border p-2">
          <Icon className="h-5 w-5 text-muted-foreground" />
        </div>
      </CardHeader>
      {hasGrowth ? (
        <CardContent>
          <p
            className={cn(
              "flex items-center gap-1 text-xs font-medium",
              trendIsNeutral
                ? "text-muted-foreground"
                : trendIsUp
                  ? "text-emerald-600"
                  : trendIsDown
                    ? "text-amber-600"
                    : "text-muted-foreground"
            )}
          >
            {trendIsNeutral ? (
              <Minus className="h-3.5 w-3.5" />
            ) : trendIsUp ? (
              <TrendingUp className="h-3.5 w-3.5" />
            ) : (
              <TrendingDown className="h-3.5 w-3.5" />
            )}
            {metric.growth} vs last period
          </p>
        </CardContent>
      ) : null}
    </Card>
  );
}
