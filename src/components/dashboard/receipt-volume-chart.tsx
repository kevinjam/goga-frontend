"use client";

import {
  Bar,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  BarChart
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { VolumePoint } from "@/types/dashboard";

export function ReceiptVolumeChart({ data }: { data: VolumePoint[] }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Receipt Volume (Last 30 Days)</CardTitle>
      </CardHeader>
      <CardContent className="h-[260px] md:h-[320px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="day" tick={{ fontSize: 12 }} minTickGap={12} />
            <YAxis tick={{ fontSize: 12 }} width={48} />
            <Tooltip />
            <Bar dataKey="receipts" fill="hsl(var(--primary))" radius={[6, 6, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
