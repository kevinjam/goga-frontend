"use client";

import { useEffect, useRef, useState } from "react";
import { DashboardSkeleton } from "@/components/dashboard/dashboard-skeleton";
import { MetricCard } from "@/components/dashboard/metric-card";
import { ReceiptVolumeChart } from "@/components/dashboard/receipt-volume-chart";
import { ExpenseCategoryChart } from "@/components/dashboard/expense-category-chart";
import { dashboardService } from "@/services/api/dashboardService";
import { paymentsService } from "@/services/api/paymentsService";
import type { DashboardMetrics, KpiMetric, KpiTrend } from "@/types/dashboard";
import type { PaymentRecord } from "@/types/payments";
import { CheckCircle2, Clock, CreditCard, DollarSign, FileText, Users } from "lucide-react";

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
  const [recentPayments, setRecentPayments] = useState<PaymentRecord[]>([]);
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

        const [stats, paymentResponse] = await Promise.all([
          dashboardService.getStats(),
          paymentsService.getPayments({ page: 1, limit: 4 })
        ]);

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
        setRecentPayments(paymentResponse.data);
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
        <h1 className="font-display text-xl font-bold md:text-2xl">Dashboard Overview</h1>
        <p className="text-sm text-destructive">
          {error ?? "Unable to load dashboard metrics."}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {isRefreshing ? (
        <div className="h-0.5 overflow-hidden rounded bg-neutral-100">
          <div className="h-full w-1/3 animate-pulse bg-goga-crimson" />
        </div>
      ) : null}

      <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {metrics.kpis.map((metric) => (
          <MetricCard key={metric.id} metric={metric} />
        ))}
      </section>

      <section className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <ReceiptVolumeChart data={metrics.receiptVolume} />
        <ExpenseCategoryChart data={metrics.expenseCategories} />
      </section>

      <section className="space-y-3 rounded-lg border border-neutral-200 bg-white p-5 shadow-xs dark:border-neutral-800 dark:bg-neutral-900">
        <div className="flex items-center justify-between border-b border-neutral-100 pb-3 dark:border-neutral-800">
          <div>
            <h3 className="font-display text-sm font-bold tracking-tight text-neutral-900 dark:text-neutral-100">
              Active Financial ledger Feed
            </h3>
            <p className="text-[10px] text-neutral-400">
              Latest reconciled and approved transaction posts
            </p>
          </div>
          <span className="flex items-center gap-1 text-[11px] text-neutral-400">
            <Clock className="h-3.5 w-3.5" />
            <span>Recently synced</span>
          </span>
        </div>

        <div className="divide-y divide-neutral-100 text-xs dark:divide-neutral-800">
          {recentPayments.length > 0 ? (
            recentPayments.map((txn) => (
              <div key={txn.id} className="flex items-center justify-between gap-4 py-3">
                <div className="flex items-center gap-3">
                  <div className="rounded border border-neutral-150 bg-neutral-50 p-2 text-neutral-700 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-200">
                    <CreditCard className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="font-semibold text-neutral-800 dark:text-neutral-100">
                      {txn.receivedFrom ?? "Payment Entry"}
                    </p>
                    <p className="font-mono text-[10px] text-neutral-400">
                      ID: {txn.id} | Ref: {txn.transactionReference}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-mono font-bold text-neutral-800 dark:text-neutral-100">
                    UGX {txn.amount.toLocaleString()}
                  </p>
                  <span className="inline-block rounded border border-green-150 bg-green-50 px-1.5 py-0.5 text-[9px] font-bold text-green-700">
                    Approved
                  </span>
                </div>
              </div>
            ))
          ) : (
            <p className="py-6 text-center text-sm text-neutral-400">
              No recent ledger entries yet.
            </p>
          )}
        </div>
      </section>
    </div>
  );
}
