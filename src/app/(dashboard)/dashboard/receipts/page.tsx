"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { toast } from "sonner";
import Link from "next/link";
import { SlidersHorizontal, TrendingUp, Shield, Plus } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui";
import { receiptsService } from "@/services/api/receiptsService";
import { useDebounce } from "@/hooks/useDebounce";
import type { EnrichedReceiptRecord, ReceiptSource } from "@/types/receipts";
import { ReceiptsToolbar, type ReceiptSortKey } from "@/features/receipts/components/receipts-toolbar";
import { ReceiptsTable } from "@/features/receipts/components/receipts-table";
import { ReceiptPreviewSheet } from "@/features/receipts/components/receipt-preview-sheet";

function sortRows(rows: EnrichedReceiptRecord[], sortBy: ReceiptSortKey) {
  return [...rows].sort((left, right) => {
    if (sortBy === "processed-desc") {
      return new Date(right.createdAt).getTime() - new Date(left.createdAt).getTime();
    }
    if (sortBy === "processed-asc") {
      return new Date(left.createdAt).getTime() - new Date(right.createdAt).getTime();
    }
    if (sortBy === "source") {
      return left.source.localeCompare(right.source);
    }
    const leftAmount = left.payment?.amount ?? 0;
    const rightAmount = right.payment?.amount ?? 0;
    return sortBy === "amount-desc" ? rightAmount - leftAmount : leftAmount - rightAmount;
  });
}

function searchRows(rows: EnrichedReceiptRecord[], query: string) {
  const term = query.trim().toLowerCase();
  if (!term) return rows;
  return rows.filter((row) => {
    const vendor = row.payment?.receivedFrom?.toLowerCase() ?? "";
    const purpose = row.payment?.purpose?.toLowerCase() ?? "";
    const invoice = row.payment?.transactionReference.toLowerCase() ?? "";
    const receiptNumber = row.receiptNumber.toLowerCase();
    return (
      vendor.includes(term) ||
      purpose.includes(term) ||
      invoice.includes(term) ||
      receiptNumber.includes(term)
    );
  });
}

export default function ReceiptsArchivePage() {
  const [search, setSearch] = useState("");
  const [source, setSource] = useState<"all" | ReceiptSource>("all");
  const [sortBy, setSortBy] = useState<ReceiptSortKey>("processed-desc");
  const [activeTab, setActiveTab] = useState<"All" | "Pending" | "Archived">("All");
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [purposeFilter, setPurposeFilter] = useState<"all" | "Annual Dues" | "Development Fund" | "Alumni Dinner" | "GOGA Souvenirs">("all");
  const [amountFilter, setAmountFilter] = useState<"all" | "under-200k" | "200k-1m" | "over-1m">("all");
  const [deliveryFilter, setDeliveryFilter] = useState<"all" | "SENT" | "PENDING" | "FAILED">("all");
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);

  const [rows, setRows] = useState<EnrichedReceiptRecord[]>([]);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [downloadingId, setDownloadingId] = useState<string | null>(null);
  const [resendingId, setResendingId] = useState<string | null>(null);

  const [selectedRow, setSelectedRow] = useState<EnrichedReceiptRecord | null>(null);
  const [isPreviewLoading, setIsPreviewLoading] = useState(false);
  const [previewAssetUrl, setPreviewAssetUrl] = useState<string | null>(null);
  const [previewAssetType, setPreviewAssetType] = useState<string | null>(null);

  const debouncedSearch = useDebounce(search, 300);
  const hasLoadedOnceRef = useRef(false);

  useEffect(() => {
    const controller = new AbortController();

    if (hasLoadedOnceRef.current) {
      setIsRefreshing(true);
    } else {
      setIsInitialLoading(true);
    }

    receiptsService
      .getEnrichedReceipts(
        { page, limit, search: debouncedSearch || undefined },
        controller.signal
      )
      .then((res) => {
        if (controller.signal.aborted) return;
        setRows(res.data);
        setTotal(res.meta.total);
        setTotalPages(Math.max(res.meta.totalPages || 1, 1));
        hasLoadedOnceRef.current = true;
      })
      .catch(() => {
        if (controller.signal.aborted) return;
        toast.error("Failed to fetch receipts");
      })
      .finally(() => {
        if (controller.signal.aborted) return;
        setIsInitialLoading(false);
        setIsRefreshing(false);
      });

    return () => {
      controller.abort();
    };
  }, [page, limit, debouncedSearch]);

  useEffect(() => {
    return () => {
      receiptsService.clearPaymentCache();
    };
  }, []);

  const renderedRows = useMemo(() => {
    let next = searchRows(rows, debouncedSearch);
    if (activeTab === "Pending") {
      next = next.filter((row) => row.emailStatus === "PENDING" || row.emailStatus === "FAILED");
    } else if (activeTab === "Archived") {
      next = next.filter((row) => row.emailStatus === "SENT");
    }
    if (deliveryFilter !== "all") {
      next = next.filter((row) => row.emailStatus === deliveryFilter);
    }
    if (purposeFilter !== "all") {
      next = next.filter((row) => (row.payment?.purpose ?? "").trim() === purposeFilter);
    }
    if (amountFilter !== "all") {
      next = next.filter((row) => {
        const amount = row.payment?.amount ?? 0;
        if (amountFilter === "under-200k") return amount < 200000;
        if (amountFilter === "200k-1m") return amount >= 200000 && amount <= 1000000;
        return amount > 1000000;
      });
    }
    if (source !== "all") {
      next = next.filter((row) => row.source === source);
    }
    return sortRows(next, sortBy);
  }, [rows, activeTab, source, sortBy, debouncedSearch, purposeFilter, amountFilter, deliveryFilter]);

  const stats = useMemo(() => {
    const total = rows.length;
    const totalAmount = rows.reduce((sum, row) => sum + (row.payment?.amount ?? 0), 0);
    const pendingCount = rows.filter(
      (row) => row.emailStatus === "PENDING" || row.emailStatus === "FAILED"
    ).length;
    return {
      total,
      totalAmount,
      pendingCount
    };
  }, [rows]);

  async function handleDownload(id: string) {
    try {
      setDownloadingId(id);
      await receiptsService.downloadReceiptPdf(id);
      toast.success("Receipt PDF downloaded");
    } catch {
      toast.error("Unable to download receipt PDF");
    } finally {
      setDownloadingId(null);
    }
  }

  async function handleResend(id: string) {
    try {
      setResendingId(id);
      await receiptsService.resendReceiptEmail(id);
      toast.success("Receipt email resent successfully");
    } catch {
      toast.error("Failed to resend receipt email");
    } finally {
      setResendingId(null);
    }
  }

  async function handleOpenPreview(row: EnrichedReceiptRecord) {
    setSelectedRow(row);
    setPreviewAssetUrl(null);
    setPreviewAssetType(null);
    setIsPreviewLoading(true);

    try {
      const asset = await receiptsService.getReceiptPreviewAsset(row.id);
      setPreviewAssetUrl(asset.url);
      setPreviewAssetType(asset.mimeType);
    } catch {
      toast.error("Failed to load receipt preview");
    } finally {
      setIsPreviewLoading(false);
    }
  }

  function handleClosePreview(open: boolean) {
    if (open) return;
    if (previewAssetUrl) URL.revokeObjectURL(previewAssetUrl);
    setSelectedRow(null);
    setPreviewAssetUrl(null);
    setPreviewAssetType(null);
    setIsPreviewLoading(false);
  }

  return (
    <section className="space-y-6">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <div className="rounded-lg border border-neutral-200 bg-white p-5 shadow-xs dark:border-neutral-800 dark:bg-neutral-900">
          <div className="flex items-start justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-neutral-400">
              Total Receipts
            </span>
            <div className="rounded-md border border-goga-crimson/10 bg-goga-crimson/5 px-2 py-0.5 text-[10px] font-mono font-bold text-goga-crimson">
              LIVE
            </div>
          </div>
          <p className="mt-4 font-mono text-3xl font-extrabold tracking-tight text-neutral-900 dark:text-neutral-100">
            {stats.total.toLocaleString()}
          </p>
          <p className="mt-1 flex items-center gap-1 text-[11px] font-semibold text-green-600">
            <TrendingUp className="h-3.5 w-3.5" />
            Updated with latest processing
          </p>
        </div>

        <div className="rounded-lg border border-neutral-200 bg-white p-5 shadow-xs dark:border-neutral-800 dark:bg-neutral-900">
          <div className="flex items-start justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-neutral-400">
              Value Generated
            </span>
            <div className="rounded-md border border-emerald-150 bg-emerald-50 px-2 py-0.5 text-[10px] font-mono font-bold text-emerald-700">
              UGX
            </div>
          </div>
          <p className="mt-4 font-mono text-2xl font-extrabold tracking-tight text-neutral-900 dark:text-neutral-100">
            UGX {stats.totalAmount.toLocaleString()}
          </p>
          <p className="mt-1 text-[11px] text-neutral-400">Summed from synced payment records</p>
        </div>

        <div className="rounded-lg border border-neutral-200 bg-white p-5 shadow-xs dark:border-neutral-800 dark:bg-neutral-900">
          <div className="flex items-start justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-neutral-400">
              Pending Emails
            </span>
            <div className="rounded-md border border-amber-100 bg-amber-50 px-2 py-0.5 text-[10px] font-mono font-bold text-amber-700">
              ACTION
            </div>
          </div>
          <p className="mt-4 font-mono text-3xl font-extrabold tracking-tight text-neutral-900 dark:text-neutral-100">
            {stats.pendingCount}
          </p>
          <p className="mt-1 text-[11px] text-neutral-400">Includes failed + queued email delivery</p>
        </div>

        <div className="relative overflow-hidden rounded-lg border border-neutral-200 bg-white p-5 shadow-xs dark:border-neutral-800 dark:bg-neutral-900">
          <div className="pointer-events-none absolute -bottom-4 -right-4 opacity-5">
            <Shield className="h-24 w-24" />
          </div>
          <span className="text-[11px] font-bold uppercase tracking-wider text-neutral-400">
            System Health
          </span>
          <p className="mt-4 font-mono text-3xl font-extrabold tracking-tight text-neutral-900 dark:text-neutral-100">
            100%
          </p>
          <p className="mt-1 text-[11px] font-semibold text-emerald-600">Receipt processing operational</p>
        </div>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap items-center gap-2">
          <Link
            href="/dashboard/payments/upload"
            className="inline-flex items-center gap-2 rounded bg-goga-crimson px-4 py-2 text-xs font-bold text-white shadow-sm transition-all hover:bg-goga-crimson-hover"
          >
            <Plus className="h-3.5 w-3.5" />
            Generate Bulk Receipts
          </Link>
          <button
            type="button"
            onClick={() => setShowAdvancedFilters((v) => !v)}
            className={`inline-flex items-center gap-2 rounded border px-4 py-2 text-xs font-bold transition-all ${
              showAdvancedFilters || purposeFilter !== "all" || amountFilter !== "all" || deliveryFilter !== "all"
                ? "border-goga-crimson bg-goga-crimson/5 text-goga-crimson"
                : "border-neutral-200 bg-white text-neutral-700 hover:bg-neutral-50 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-200"
            }`}
          >
            <SlidersHorizontal className="h-3.5 w-3.5" />
            Advanced Filters
          </button>
        </div>
      </div>

      {showAdvancedFilters ? (
        <div className="grid gap-4 rounded-lg border border-neutral-200 bg-white p-4 shadow-xs sm:grid-cols-2 lg:grid-cols-4 dark:border-neutral-800 dark:bg-neutral-900">
          <div>
            <label className="mb-1 block text-[10px] font-bold uppercase tracking-wider text-neutral-400">
              Delivery Status
            </label>
            <select
              value={deliveryFilter}
              onChange={(event) => {
                setPage(1);
                setDeliveryFilter(event.target.value as typeof deliveryFilter);
              }}
              className="w-full rounded border border-neutral-200 bg-white p-2 text-xs outline-none dark:border-neutral-700 dark:bg-neutral-900"
            >
              <option value="all">All statuses</option>
              <option value="SENT">Sent</option>
              <option value="PENDING">Pending</option>
              <option value="FAILED">Failed</option>
            </select>
          </div>
          <div>
            <label className="mb-1 block text-[10px] font-bold uppercase tracking-wider text-neutral-400">
              Purpose Category
            </label>
            <select
              value={purposeFilter}
              onChange={(event) => {
                setPage(1);
                setPurposeFilter(event.target.value as typeof purposeFilter);
              }}
              className="w-full rounded border border-neutral-200 bg-white p-2 text-xs outline-none dark:border-neutral-700 dark:bg-neutral-900"
            >
              <option value="all">All purposes</option>
              <option value="Annual Dues">Annual Dues</option>
              <option value="Development Fund">Development Fund</option>
              <option value="Alumni Dinner">Alumni Dinner</option>
              <option value="GOGA Souvenirs">GOGA Souvenirs</option>
            </select>
          </div>
          <div>
            <label className="mb-1 block text-[10px] font-bold uppercase tracking-wider text-neutral-400">
              Amount Range
            </label>
            <select
              value={amountFilter}
              onChange={(event) => {
                setPage(1);
                setAmountFilter(event.target.value as typeof amountFilter);
              }}
              className="w-full rounded border border-neutral-200 bg-white p-2 text-xs outline-none dark:border-neutral-700 dark:bg-neutral-900"
            >
              <option value="all">Any amount</option>
              <option value="under-200k">Under UGX 200,000</option>
              <option value="200k-1m">UGX 200,000 - UGX 1,000,000</option>
              <option value="over-1m">Over UGX 1,000,000</option>
            </select>
          </div>
          <div className="flex items-end">
            <button
              type="button"
              onClick={() => {
                setPage(1);
                setPurposeFilter("all");
                setAmountFilter("all");
                setDeliveryFilter("all");
                setSearch("");
                setSource("all");
                setSortBy("processed-desc");
              }}
              className="w-full rounded border border-dashed border-neutral-300 py-2 text-xs font-semibold text-neutral-600 transition-all hover:border-neutral-500 hover:text-neutral-800 dark:border-neutral-700 dark:text-neutral-300 dark:hover:text-neutral-100"
            >
              Reset Active Filters
            </button>
          </div>
        </div>
      ) : null}

      <Card className="overflow-hidden">
        <CardHeader className="border-b border-neutral-200 bg-neutral-50 pb-3 dark:border-neutral-800 dark:bg-neutral-900/50">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <CardTitle className="uppercase">Search & Sorting</CardTitle>
            <div className="inline-flex w-fit gap-0.5 rounded-md bg-neutral-100 p-0.5 dark:bg-neutral-800">
              {(["All", "Pending", "Archived"] as const).map((tab) => (
                <button
                  key={tab}
                  type="button"
                  onClick={() => {
                    setPage(1);
                    setActiveTab(tab);
                  }}
                  className={`rounded-md px-3 py-1 text-xs font-semibold transition-all ${
                    activeTab === tab
                      ? "bg-white text-goga-crimson shadow-xs dark:bg-neutral-900"
                      : "text-neutral-500 hover:text-neutral-800 dark:text-neutral-400 dark:hover:text-neutral-100"
                  }`}
                >
                  {tab} Receipts
                </button>
              ))}
            </div>
          </div>
        </CardHeader>
        <CardContent className="pt-4">
          <ReceiptsToolbar
            search={search}
            source={source}
            sortBy={sortBy}
            onSearchChange={(value) => {
              setPage(1);
              setSearch(value);
            }}
            onSourceChange={(value) => {
              setPage(1);
              setSource(value);
            }}
            onSortChange={setSortBy}
          />
        </CardContent>
      </Card>

      <ReceiptsTable
        rows={renderedRows}
        isLoading={isInitialLoading}
        isRefreshing={isRefreshing}
        page={page}
        limit={limit}
        total={total}
        totalPages={totalPages}
        downloadingId={downloadingId}
        resendingId={resendingId}
        onPageChange={setPage}
        onLimitChange={(nextLimit) => {
          setPage(1);
          setLimit(nextLimit);
        }}
        onRowClick={(row) => void handleOpenPreview(row)}
        onDownload={handleDownload}
        onResend={handleResend}
      />

      <div className="rounded-xl border border-dashed border-goga-crimson/20 bg-goga-crimson/5 p-4 sm:p-5">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="font-display text-sm font-bold tracking-tight text-neutral-900 dark:text-neutral-100">
              Receipt Backup & Archive
            </p>
            <p className="text-[11px] text-neutral-500">
              Keep synchronized copies of generated receipts for audit, compliance, and recovery.
            </p>
          </div>
          <button
            type="button"
            className="rounded bg-goga-crimson px-4 py-2 text-xs font-bold text-white transition-all hover:bg-goga-crimson-hover"
            onClick={() => toast.info("Backup workflow will be available in the next update.")}
          >
            Trigger Backup
          </button>
        </div>
      </div>

      <ReceiptPreviewSheet
        open={Boolean(selectedRow)}
        row={selectedRow}
        isLoading={isPreviewLoading}
        assetUrl={previewAssetUrl}
        mimeType={previewAssetType}
        downloadingId={downloadingId}
        onOpenChange={handleClosePreview}
        onDownload={handleDownload}
      />
    </section>
  );
}
