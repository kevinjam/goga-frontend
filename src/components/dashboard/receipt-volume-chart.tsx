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
import type { VolumePoint } from "@/types/dashboard";

export function ReceiptVolumeChart({ data }: { data: VolumePoint[] }) {
  return (
    <div className="space-y-4 rounded-lg border border-neutral-200 bg-white p-5 shadow-xs dark:border-neutral-800 dark:bg-neutral-900 lg:col-span-2">
      <div>
        <h3 className="font-display text-sm font-bold tracking-tight text-neutral-900 dark:text-neutral-100">
          Receipt Volume (Last 30 Days)
        </h3>
        <p className="text-[10px] text-neutral-400">Daily receipt count processed</p>
      </div>
      <div className="h-64 font-mono text-xs">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
            <XAxis dataKey="day" stroke="#94a3b8" fontSize={10} tickLine={false} />
            <YAxis stroke="#94a3b8" fontSize={10} tickLine={false} width={40} />
            <Tooltip
              contentStyle={{
                backgroundColor: "#ffffff",
                borderRadius: "6px",
                fontSize: "11px",
                border: "1px solid #e2e8f0"
              }}
            />
            <Bar dataKey="receipts" fill="#9e0027" radius={[4, 4, 0, 0]} maxBarSize={32} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
