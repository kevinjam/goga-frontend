"use client";

import {
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { CategoryPoint } from "@/types/dashboard";

const COLORS = ["#1d4ed8", "#0f766e", "#9333ea", "#ea580c", "#0891b2"];

export function ExpenseCategoryChart({ data }: { data: CategoryPoint[] }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Revenue Breakdown by Payment Method</CardTitle>
      </CardHeader>
      <CardContent className="h-[260px] md:h-[320px]">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              dataKey="amount"
              nameKey="category"
              innerRadius="55%"
              outerRadius="80%"
              paddingAngle={2}
            >
              {data.map((entry, index) => (
                <Cell
                  key={entry.category}
                  fill={COLORS[index % COLORS.length]}
                />
              ))}
            </Pie>
            <Tooltip />
            <Legend wrapperStyle={{ fontSize: 12 }} />
          </PieChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
