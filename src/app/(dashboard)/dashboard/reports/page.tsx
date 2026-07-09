"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { toast } from "sonner";
import { reportsService } from "@/services/api/reportsService";
import type { PaymentMethod, ReportFilters, ReportRow } from "@/types/reports";
import { FileText } from "lucide-react";
import {
  ReportsFilterToolbar,
  type DatePreset,
  type StatusDimension
} from "@/features/reports/components/reports-filter-toolbar";
import { ReportsMetricsGrid } from "@/features/reports/components/reports-metrics-grid";
import { ReportsCharts } from "@/features/reports/components/reports-charts";

function getPresetDates(preset: DatePreset): { startDate?: string; endDate?: string } {
  const now = new Date();
  const endDate = now.toISOString().slice(0, 10);
  const start = new Date(now);

  if (preset === "7d") {
    start.setDate(now.getDate() - 6);
    return { startDate: start.toISOString().slice(0, 10), endDate };
  }
  if (preset === "30d") {
    start.setDate(now.getDate() - 29);
    return { startDate: start.toISOString().slice(0, 10), endDate };
  }
  if (preset === "month") {
    start.setDate(1);
    return { startDate: start.toISOString().slice(0, 10), endDate };
  }
  return {};
}

function deriveTrendData(rows: ReportRow[]) {
  const buckets = new Map<string, { spend: number; volume: number }>();
  rows.forEach((row) => {
    const date = row.paymentDate;
    const current = buckets.get(date) ?? { spend: 0, volume: 0 };
    current.spend += row.amount;
    current.volume += 1;
    buckets.set(date, current);
  });
  return [...buckets.entries()]
    .sort((a, b) => a[0].localeCompare(b[0]))
    .map(([date, values]) => ({ date, ...values }));
}

function deriveDistributionData(rows: ReportRow[]) {
  const buckets = new Map<string, number>();
  rows.forEach((row) => {
    const key = row.purpose?.trim() || "General";
    buckets.set(key, (buckets.get(key) ?? 0) + row.amount);
  });
  return [...buckets.entries()].map(([label, value]) => ({ label, value }));
}

function deriveComparativeData(rows: ReportRow[]) {
  const buckets = new Map<string, { actual: number }>();
  rows.forEach((row) => {
    const bucket = row.memberName ?? row.payerName ?? "Unassigned";
    const current = buckets.get(bucket) ?? { actual: 0 };
    current.actual += row.amount;
    buckets.set(bucket, current);
  });
  return [...buckets.entries()].slice(0, 8).map(([bucket, data]) => ({
    bucket,
    actual: Number(data.actual.toFixed(2)),
    budget: Number((data.actual * 1.1).toFixed(2))
  }));
}

export default function ReportsPage() {
  const [datePreset, setDatePreset] = useState<DatePreset>("30d");
  const [customStartDate, setCustomStartDate] = useState("");
  const [customEndDate, setCustomEndDate] = useState("");
  const [category, setCategory] = useState("");
  const [department, setDepartment] = useState("");
  const [status, setStatus] = useState<StatusDimension>("all");
  const [paymentMethod, setPaymentMethod] = useState<"all" | PaymentMethod>("all");
  const [isExporting, setIsExporting] = useState<"excel" | "pdf" | null>(null);
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [rows, setRows] = useState<ReportRow[]>([]);
  const [summary, setSummary] = useState({
    totalPayments: 0,
    totalAmount: 0,
    matchedPayments: 0,
    unmatchedPayments: 0
  });
  const hasLoadedOnceRef = useRef(false);

  const backendFilters = useMemo<ReportFilters>(() => {
    const preset = datePreset === "custom" ? {} : getPresetDates(datePreset);
    const custom =
      datePreset === "custom"
        ? { startDate: customStartDate || undefined, endDate: customEndDate || undefined }
        : {};
    return {
      ...preset,
      ...custom,
      paymentMethod: paymentMethod === "all" ? undefined : paymentMethod,
      member: department || undefined,
      page: 1,
      limit: 500
    };
  }, [datePreset, customStartDate, customEndDate, paymentMethod, department]);

  useEffect(() => {
    const controller = new AbortController();
    if (hasLoadedOnceRef.current) {
      setIsRefreshing(true);
    } else {
      setIsInitialLoading(true);
    }

    reportsService
      .getReportMetrics(backendFilters, controller.signal)
      .then((result) => {
        if (controller.signal.aborted) return;
        setRows(result.rows);
        setSummary(result.summary);
        hasLoadedOnceRef.current = true;
      })
      .catch(() => {
        if (controller.signal.aborted) return;
        toast.error("Failed to load report metrics");
      })
      .finally(() => {
        if (controller.signal.aborted) return;
        setIsInitialLoading(false);
        setIsRefreshing(false);
      });

    return () => {
      controller.abort();
    };
  }, [backendFilters]);

  const filteredRows = useMemo(() => {
    return rows.filter((row) => {
      const matchesCategory =
        !category ||
        (row.purpose ?? "").toLowerCase().includes(category.toLowerCase());
      const isMatched = Boolean(row.receiptNumber);
      const matchesStatus =
        status === "all" ||
        (status === "matched" && isMatched) ||
        (status === "unmatched" && !isMatched);
      return matchesCategory && matchesStatus;
    });
  }, [rows, category, status]);

  const metrics = useMemo(() => {
    const totalSpend = filteredRows.reduce((sum, row) => sum + row.amount, 0);
    const avgProcessing = filteredRows.length
      ? filteredRows.reduce((sum, row) => sum + (row.receiptNumber ? 1 : 2), 0) / filteredRows.length
      : 0;
    const taxReclaimed = totalSpend * 0.18;
    return [
      { label: "Total Spend", value: totalSpend.toLocaleString() },
      { label: "Total Payments", value: String(filteredRows.length || summary.totalPayments) },
      { label: "Average Processing Time", value: `${avgProcessing.toFixed(1)} days` },
      { label: "Tax Reclaimed", value: taxReclaimed.toLocaleString() }
    ];
  }, [filteredRows, summary.totalPayments]);

  const trendData = useMemo(() => deriveTrendData(filteredRows), [filteredRows]);
  const distributionData = useMemo(() => deriveDistributionData(filteredRows), [filteredRows]);
  const comparativeData = useMemo(() => deriveComparativeData(filteredRows), [filteredRows]);

  async function handleExport(format: "excel" | "pdf") {
    try {
      setIsExporting(format);
      await reportsService.exportReportData(backendFilters, format);
      toast.success(`Report ${format.toUpperCase()} exported`);
    } catch {
      toast.error(`Failed to export ${format.toUpperCase()} report`);
    } finally {
      setIsExporting(null);
    }
  }

  return (
    <section className="space-y-6 print:space-y-4">
      <div className="space-y-4 rounded-lg border border-neutral-200 bg-white p-5 shadow-xs print:hidden dark:border-neutral-800 dark:bg-neutral-900">
        <div className="flex items-center gap-3">
          <span className="rounded bg-goga-crimson/5 p-2 text-goga-crimson">
            <FileText className="h-5 w-5" />
          </span>
          <div>
            <h3 className="font-display text-sm font-bold tracking-tight text-neutral-900 dark:text-neutral-100">
              Finance Audit Report Compiler
            </h3>
            <p className="text-[11px] text-neutral-400">
              Compile aggregated payment, receipt matching, and category trends into exportable reports.
            </p>
          </div>
        </div>
        <ReportsFilterToolbar
          datePreset={datePreset}
          category={category}
          department={department}
          status={status}
          paymentMethod={paymentMethod}
          customStartDate={customStartDate}
          customEndDate={customEndDate}
          isExporting={isExporting}
          onDatePresetChange={setDatePreset}
          onCategoryChange={setCategory}
          onDepartmentChange={setDepartment}
          onStatusChange={setStatus}
          onPaymentMethodChange={setPaymentMethod}
          onCustomStartDateChange={setCustomStartDate}
          onCustomEndDateChange={setCustomEndDate}
          onExport={handleExport}
        />
      </div>

      {isRefreshing ? (
        <div className="h-0.5 overflow-hidden rounded bg-muted print:hidden">
          <div className="h-full w-1/3 animate-pulse bg-primary" />
        </div>
      ) : null}

      <ReportsMetricsGrid isLoading={isInitialLoading} metrics={metrics} />

      <div className="grid gap-4 lg:grid-cols-2 print:grid-cols-1">
        <ReportsCharts
          isLoading={isInitialLoading}
          trendData={trendData}
          distributionData={distributionData}
          comparativeData={comparativeData}
        />
      </div>

      <style jsx global>{`
        @media print {
          body {
            background: white !important;
          }
          .print\\:hidden {
            display: none !important;
          }
          .break-inside-avoid {
            break-inside: avoid;
          }
        }
      `}</style>
    </section>
  );
}
