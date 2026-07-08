"use client";

import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle, Skeleton } from "@/components/ui";

const PIE_COLORS = ["#1d4ed8", "#0f766e", "#9333ea", "#ea580c", "#0891b2", "#dc2626"];
const CHART_HEIGHT = "h-[260px] md:h-[340px]";
const AXIS_TICK = { fontSize: 12 };

function LoadingChartCard({ title }: { title: string }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base md:text-lg">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <Skeleton className={`${CHART_HEIGHT} w-full`} />
      </CardContent>
    </Card>
  );
}

export function ReportsCharts({
  isLoading,
  trendData,
  distributionData,
  comparativeData
}: {
  isLoading: boolean;
  trendData: Array<{ date: string; spend: number; volume: number }>;
  distributionData: Array<{ label: string; value: number }>;
  comparativeData: Array<{ bucket: string; budget: number; actual: number }>;
}) {
  if (isLoading) {
    return (
      <>
        <LoadingChartCard title="Spend & Volume Trend" />
        <LoadingChartCard title="Distribution Breakdown" />
        <LoadingChartCard title="Budget vs Actual" />
      </>
    );
  }

  return (
    <>
      <Card className="break-inside-avoid">
        <CardHeader>
          <CardTitle className="text-base md:text-lg">Trend Analysis (Spend vs Volume)</CardTitle>
        </CardHeader>
        <CardContent className={CHART_HEIGHT}>
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={trendData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" tick={AXIS_TICK} minTickGap={12} />
              <YAxis tick={AXIS_TICK} width={48} />
              <Tooltip />
              <Area dataKey="spend" stroke="hsl(var(--primary))" fill="hsl(var(--primary) / 0.25)" />
              <Area dataKey="volume" stroke="hsl(var(--success))" fill="hsl(var(--success) / 0.2)" />
            </AreaChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <Card className="break-inside-avoid">
        <CardHeader>
          <CardTitle className="text-base md:text-lg">Distribution Breakdown</CardTitle>
        </CardHeader>
        <CardContent className={CHART_HEIGHT}>
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={distributionData}
                dataKey="value"
                nameKey="label"
                innerRadius="55%"
                outerRadius="80%"
                paddingAngle={2}
              >
                {distributionData.map((item, idx) => (
                  <Cell key={item.label} fill={PIE_COLORS[idx % PIE_COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
              <Legend wrapperStyle={{ fontSize: 12 }} />
            </PieChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <Card className="break-inside-avoid">
        <CardHeader>
          <CardTitle className="text-base md:text-lg">Comparative Analysis (Budget vs Actual)</CardTitle>
        </CardHeader>
        <CardContent className={CHART_HEIGHT}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={comparativeData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="bucket" tick={AXIS_TICK} minTickGap={8} />
              <YAxis tick={AXIS_TICK} width={48} />
              <Tooltip />
              <Legend wrapperStyle={{ fontSize: 12 }} />
              <Bar dataKey="budget" fill="#64748b" />
              <Bar dataKey="actual" fill="hsl(var(--primary))" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </>
  );
}
