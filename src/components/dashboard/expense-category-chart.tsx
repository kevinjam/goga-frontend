"use client";

import {
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip
} from "recharts";
import type { CategoryPoint } from "@/types/dashboard";

const DEFAULT_COLORS = ["#3755c3", "#454d63", "#9e0027", "#0891b2", "#7c3aed"];

function getCategoryColor(category: string, index: number) {
  const key = category.toLowerCase();
  if (key.includes("mtn")) return "#eab308";
  if (key.includes("airtel")) return "#dc2626";
  if (key.includes("bank")) return "#2563eb";
  if (key.includes("cash")) return "#0f766e";
  return DEFAULT_COLORS[index % DEFAULT_COLORS.length];
}

export function ExpenseCategoryChart({ data }: { data: CategoryPoint[] }) {
  return (
    <div className="space-y-4 rounded-lg border border-neutral-200 bg-white p-5 shadow-xs dark:border-neutral-800 dark:bg-neutral-900">
      <div>
        <h3 className="font-display text-sm font-bold tracking-tight text-neutral-900 dark:text-neutral-100">
          Revenue by Payment Method
        </h3>
        <p className="text-[10px] text-neutral-400">Distribution across channels</p>
      </div>
      <div className="h-64 font-mono text-xs">
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
                <Cell key={entry.category} fill={getCategoryColor(entry.category, index)} />
              ))}
            </Pie>
            <Tooltip
              contentStyle={{
                backgroundColor: "#ffffff",
                borderRadius: "6px",
                fontSize: "11px",
                border: "1px solid #e2e8f0"
              }}
            />
            <Legend wrapperStyle={{ fontSize: 10 }} />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
