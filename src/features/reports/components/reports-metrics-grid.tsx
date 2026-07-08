"use client";

import { Card, CardContent, CardHeader, CardTitle, Skeleton } from "@/components/ui";

export function ReportsMetricsGrid({
  isLoading,
  metrics
}: {
  isLoading: boolean;
  metrics: Array<{ label: string; value: string }>;
}) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {metrics.map((metric) => (
        <Card key={metric.label}>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">{metric.label}</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-8 w-24" />
            ) : (
              <p className="text-xl font-semibold md:text-2xl">{metric.value}</p>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
