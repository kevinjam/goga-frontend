import { Card, CardContent, CardHeader, Skeleton } from "@/components/ui";

function MetricCardSkeleton() {
  return (
    <Card>
      <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
        <div className="space-y-3">
          <Skeleton className="h-4 w-28" />
          <Skeleton className="h-8 w-24" />
        </div>
        <Skeleton className="h-9 w-9 rounded-md" />
      </CardHeader>
      <CardContent>
        <Skeleton className="h-4 w-32" />
      </CardContent>
    </Card>
  );
}

function ChartCardSkeleton({ titleWidth = "w-48" }: { titleWidth?: string }) {
  return (
    <Card>
      <CardHeader>
        <Skeleton className={`h-6 ${titleWidth}`} />
      </CardHeader>
      <CardContent>
        <Skeleton className="h-[260px] w-full md:h-[320px]" />
      </CardContent>
    </Card>
  );
}

export function DashboardSkeleton() {
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <Skeleton className="h-8 w-56" />
        <Skeleton className="h-4 w-72" />
      </div>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <MetricCardSkeleton key={index} />
        ))}
      </section>

      <section className="grid gap-4 xl:grid-cols-2">
        <ChartCardSkeleton titleWidth="w-56" />
        <ChartCardSkeleton titleWidth="w-64" />
      </section>
    </div>
  );
}
