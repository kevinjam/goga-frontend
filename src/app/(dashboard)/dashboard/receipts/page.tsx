"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { toast } from "sonner";
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
    if (source !== "all") {
      next = next.filter((row) => row.source === source);
    }
    return sortRows(next, sortBy);
  }, [rows, source, sortBy, debouncedSearch]);

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
      <div>
        <h1 className="text-xl font-semibold tracking-tight md:text-2xl">Receipts Archive</h1>
        <p className="text-sm text-muted-foreground">
          Browse processed receipts, preview files, download PDFs, and resend notifications.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Search & Sorting</CardTitle>
        </CardHeader>
        <CardContent>
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
