"use client";

import { useEffect, useRef, useState } from "react";
import { DashboardSkeleton } from "@/components/dashboard/dashboard-skeleton";
import { MetricCard } from "@/components/dashboard/metric-card";
import { ReceiptVolumeChart } from "@/components/dashboard/receipt-volume-chart";
import { ExpenseCategoryChart } from "@/components/dashboard/expense-category-chart";
import { branding } from "@/config/branding";
import { dashboardService } from "@/services/api/dashboardService";
import type { DashboardMetrics, KpiMetric, KpiTrend } from "@/types/dashboard";
import { CheckCircle2, DollarSign, FileText, Users } from "lucide-react";

function formatInt(n: number): string {
  return n.toLocaleString("en-US");
}

function formatUGX(n: number): string {
  return `UGX ${formatInt(n)}`;
}

function methodLabel(method: string): string {
  switch (method) {
    case "BANK":
      return "Bank";
    case "MTN_MOMO":
      return "MTN MoMo";
    case "AIRTEL_MONEY":
      return "Airtel Money";
    case "CASH":
      return "Cash";
    default:
      return method;
  }
}

function formatDay(period: string): string {
  // Expected: YYYY-MM-DD
  const d = new Date(`${period}T00:00:00Z`);
  if (Number.isNaN(d.getTime())) return period;
  return d.toLocaleDateString("en-GB", { day: "2-digit", month: "short" });
}

function calcGrowthPct(curr: number, prev: number): { trend: KpiTrend; growth?: string } {
  if (!Number.isFinite(curr) || !Number.isFinite(prev) || prev === 0) {
    return { trend: "neutral" };
  }

  const pct = ((curr - prev) / prev) * 100;
  if (!Number.isFinite(pct) || Math.abs(pct) < 0.05) return { trend: "neutral" };

  const trend: KpiTrend = pct > 0 ? "up" : "down";
  const growth = `${pct >= 0 ? "+" : ""}${pct.toFixed(1)}%`;
  return { trend, growth };
}

export default function DashboardPage() {
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const hasLoadedOnceRef = useRef(false);

  useEffect(() => {
    void (async () => {
      try {
        if (hasLoadedOnceRef.current) {
          setIsRefreshing(true);
        } else {
          setIsInitialLoading(true);
        }
        setError(null);

        const stats = await dashboardService.getStats();

      const monthly = stats.monthlyCollections ?? [];
      const lastMonth = monthly[monthly.length - 1];
      const prevMonth = monthly[monthly.length - 2] ?? lastMonth;

      const receiptGrowth = calcGrowthPct(
        lastMonth?.totalCount ?? 0,
        prevMonth?.totalCount ?? 0
      );
      const revenueGrowth = calcGrowthPct(
        lastMonth?.totalAmount ?? 0,
        prevMonth?.totalAmount ?? 0
      );

      const kpis: KpiMetric[] = [
        {
          id: "receipts-last-month",
          title: "Receipts (Last Month)",
          value: formatInt(lastMonth?.totalCount ?? 0),
          growth: receiptGrowth.growth,
          trend: receiptGrowth.trend,
          icon: FileText
        },
        {
          id: "revenue-last-month",
          title: "Revenue (Last Month)",
          value: formatUGX(lastMonth?.totalAmount ?? 0),
          growth: revenueGrowth.growth,
          trend: revenueGrowth.trend,
          icon: DollarSign
        },
        {
          id: "active-members",
          title: "Active Members",
          value: formatInt(stats.totalMembers ?? 0),
          trend: "neutral",
          icon: Users
        },
        {
          id: "total-receipts",
          title: "Total Receipts",
          value: formatInt(stats.totalReceipts ?? 0),
          trend: "neutral",
          icon: CheckCircle2
        }
      ];

      const receiptVolume = (stats.dailyCollections ?? []).map((row) => ({
        day: formatDay(row.period),
        receipts: row.totalCount
      }));

      const expenseCategories = (stats.paymentsByMethod ?? []).map((row) => ({
        category: methodLabel(row.method),
        amount: row.totalAmount
      }));

      const next: DashboardMetrics = {
        kpis,
        receiptVolume,
        expenseCategories
      };

        setMetrics(next);
        hasLoadedOnceRef.current = true;
      } catch (err) {
        const message =
          err instanceof Error ? err.message : "Failed to load dashboard metrics.";
        setError(message);
      } finally {
        setIsInitialLoading(false);
        setIsRefreshing(false);
      }
    })();
  }, []);

  if (isInitialLoading) {
    return <DashboardSkeleton />;
  }

  if (error || !metrics) {
    return (
      <div className="space-y-4">
        <h1 className="text-xl font-semibold md:text-2xl">Dashboard Overview</h1>
        <p className="text-sm text-destructive">
          {error ?? "Unable to load dashboard metrics."}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {isRefreshing ? (
        <div className="h-0.5 overflow-hidden rounded bg-muted">
          <div className="h-full w-1/3 animate-pulse bg-primary" />
        </div>
      ) : null}
      <div>
        <h1 className="text-xl font-semibold md:text-2xl">
          {branding.dashboard.welcomeTitle}
        </h1>
        <p className="text-sm text-muted-foreground">
          {branding.dashboard.welcomeSubtitle}
        </p>
      </div>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {metrics.kpis.map((metric) => (
          <MetricCard key={metric.id} metric={metric} />
        ))}
      </section>

      <section className="grid gap-4 xl:grid-cols-2">
        <ReceiptVolumeChart data={metrics.receiptVolume} />
        <ExpenseCategoryChart data={metrics.expenseCategories} />
      </section>
    </div>
  );
}
