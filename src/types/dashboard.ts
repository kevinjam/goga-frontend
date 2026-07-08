import type { LucideIcon } from "lucide-react";

export type KpiTrend = "up" | "down" | "neutral";

export interface KpiMetric {
  id: string;
  title: string;
  value: string;
  growth?: string;
  trend: KpiTrend;
  icon: LucideIcon;
}

export interface VolumePoint {
  day: string;
  receipts: number;
}

export interface CategoryPoint {
  category: string;
  amount: number;
}

export interface DashboardMetrics {
  kpis: KpiMetric[];
  receiptVolume: VolumePoint[];
  expenseCategories: CategoryPoint[];
}

