"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { Upload } from "lucide-react";
import { toast } from "sonner";
import {
  Badge,
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Sheet,
  SheetContent,
  Skeleton
} from "@/components/ui";
import { useDebounce } from "@/hooks/useDebounce";
import { paymentsService } from "@/services/api/paymentsService";
import type { PaymentRecord, PaymentStatus } from "@/types/payments";
import {
  FilterToolbar,
  type DateRangeFilter,
  type MethodFilter
} from "@/features/payments/components/filter-toolbar";
import { PaymentsTable } from "@/features/payments/components/payments-table";
import { ReceiptViewer } from "@/features/payments/components/receipt-viewer";
import { PaymentStatusBadge } from "@/features/payments/components/payment-status-badge";

function applyLocalFilters(
  rows: PaymentRecord[],
  method: MethodFilter,
  dateRange: DateRangeFilter,
  rawSearch: string
) {
  const numericSearch = Number(rawSearch.replace(/,/g, ""));
  const now = Date.now();

  return rows.filter((row) => {
    const methodMatches = method === "all" || row.method === method;

    const rowDate = new Date(row.date).getTime();
    const dateOk =
      dateRange === "all" ||
      (dateRange === "7d" && now - rowDate <= 7 * 24 * 60 * 60 * 1000) ||
      (dateRange === "30d" && now - rowDate <= 30 * 24 * 60 * 60 * 1000) ||
      (dateRange === "90d" && now - rowDate <= 90 * 24 * 60 * 60 * 1000);

    const amountMatches = Number.isFinite(numericSearch)
      ? String(row.amount).includes(String(numericSearch))
      : true;

    return methodMatches && dateOk && amountMatches;
  });
}

function DetailField({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs uppercase tracking-wide text-muted-foreground">{label}</p>
      <p className="text-sm font-medium">{value}</p>
    </div>
  );
}

export default function PaymentsPage() {
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<"all" | PaymentStatus>("all");
  const [method, setMethod] = useState<MethodFilter>("all");
  const [dateRange, setDateRange] = useState<DateRangeFilter>("all");
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [rows, setRows] = useState<PaymentRecord[]>([]);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [selectedPaymentId, setSelectedPaymentId] = useState<string | null>(null);
  const [selectedPayment, setSelectedPayment] = useState<PaymentRecord | null>(null);
  const [assetUrl, setAssetUrl] = useState<string | null>(null);
  const [assetMimeType, setAssetMimeType] = useState<string | null>(null);
  const [isDetailLoading, setIsDetailLoading] = useState(false);

  const debouncedSearch = useDebounce(search, 300);
  const hasLoadedOnceRef = useRef(false);

  useEffect(() => {
    const controller = new AbortController();

    if (hasLoadedOnceRef.current) {
      setIsRefreshing(true);
    } else {
      setIsInitialLoading(true);
    }

    paymentsService
      .getPayments({
        page,
        limit,
        search: debouncedSearch || undefined,
        status: status === "all" ? undefined : status
      }, controller.signal)
      .then((res) => {
        if (controller.signal.aborted) return;
        setRows(res.data);
        setTotal(res.meta.total);
        setTotalPages(Math.max(res.meta.totalPages || 1, 1));
        hasLoadedOnceRef.current = true;
      })
      .catch((error) => {
        if (controller.signal.aborted) return;
        toast.error("Failed to load payments");
      })
      .finally(() => {
        if (controller.signal.aborted) return;
        setIsInitialLoading(false);
        setIsRefreshing(false);
      });

    return () => {
      controller.abort();
    };
  }, [page, limit, debouncedSearch, status]);

  useEffect(() => {
    if (!selectedPaymentId) return;
    let mounted = true;
    let localAssetUrl: string | null = null;
    setIsDetailLoading(true);

    paymentsService
      .getPaymentById(selectedPaymentId)
      .then(async (payment) => {
        if (!mounted) return;
        setSelectedPayment(payment);
        const receipt = await paymentsService.findReceiptByPaymentId(payment.id);
        if (!receipt) {
          if (mounted) {
            setAssetUrl(null);
            setAssetMimeType(null);
          }
          return;
        }

        const asset = await paymentsService.getReceiptAssetUrl(receipt.id);
        localAssetUrl = asset.url;
        if (mounted) {
          setAssetUrl(asset.url);
          setAssetMimeType(asset.mimeType);
        }
      })
      .catch(() => toast.error("Failed to load payment details"))
      .finally(() => {
        if (mounted) setIsDetailLoading(false);
      });

    return () => {
      mounted = false;
      if (localAssetUrl) URL.revokeObjectURL(localAssetUrl);
    };
  }, [selectedPaymentId]);

  const filteredRows = useMemo(() => {
    return applyLocalFilters(rows, method, dateRange, debouncedSearch);
  }, [rows, method, dateRange, debouncedSearch]);

  return (
    <section className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold tracking-tight md:text-2xl">Payments Ledger</h1>
          <p className="text-sm text-muted-foreground">
            Audit, verify, and examine payment records.
          </p>
        </div>
        <Link href="/dashboard/payments/upload" className="w-full sm:w-auto">
          <Button className="w-full sm:w-auto">
            <Upload className="mr-2 h-4 w-4" />
            Upload Payments
          </Button>
        </Link>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Ledger Filters</CardTitle>
        </CardHeader>
        <CardContent>
          <FilterToolbar
            search={search}
            status={status}
            method={method}
            dateRange={dateRange}
            onSearchChange={(value) => {
              setPage(1);
              setSearch(value);
            }}
            onStatusChange={(value) => {
              setPage(1);
              setStatus(value);
            }}
            onMethodChange={setMethod}
            onDateRangeChange={setDateRange}
          />
        </CardContent>
      </Card>

      <PaymentsTable
        rows={filteredRows}
        isLoading={isInitialLoading}
        isRefreshing={isRefreshing}
        page={page}
        limit={limit}
        total={total}
        totalPages={totalPages}
        onPageChange={setPage}
        onLimitChange={(nextLimit) => {
          setLimit(nextLimit);
          setPage(1);
        }}
        onSelectRow={setSelectedPaymentId}
      />

      <Sheet open={Boolean(selectedPaymentId)} onOpenChange={(open) => !open && setSelectedPaymentId(null)}>
        <SheetContent side="right" className="w-[92vw] max-w-[900px] overflow-y-auto p-4 sm:p-6">
          <div className="space-y-6">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <h2 className="text-xl font-semibold">Payment Inspection</h2>
                <p className="text-sm text-muted-foreground">
                  Review metadata and linked receipt asset.
                </p>
              </div>
              {selectedPayment ? (
                <PaymentStatusBadge status={selectedPayment.status} />
              ) : (
                <Badge variant="secondary">Loading</Badge>
              )}
            </div>

            <div className="grid gap-6 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Payment Details</CardTitle>
                </CardHeader>
                <CardContent className="grid gap-4 sm:grid-cols-2">
                  {isDetailLoading || !selectedPayment ? (
                    <>
                      <Skeleton className="h-12" />
                      <Skeleton className="h-12" />
                      <Skeleton className="h-12" />
                      <Skeleton className="h-12" />
                    </>
                  ) : (
                    <>
                      <DetailField
                        label="Payment Date"
                        value={new Date(selectedPayment.date).toLocaleDateString()}
                      />
                      <DetailField
                        label="Normalized Amount"
                        value={selectedPayment.amount.toLocaleString()}
                      />
                      <DetailField
                        label="Tax Extracted"
                        value={(selectedPayment.amount * 0.18).toLocaleString()}
                      />
                      <DetailField
                        label="Category"
                        value={selectedPayment.purpose ?? "General"}
                      />
                      <DetailField
                        label="Employee / Uploader"
                        value={selectedPayment.receivedFrom ?? "Unknown"}
                      />
                      <DetailField
                        label="Reference ID"
                        value={selectedPayment.transactionReference}
                      />
                    </>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Receipt Viewer</CardTitle>
                </CardHeader>
                <CardContent>
                  <ReceiptViewer
                    isLoading={isDetailLoading}
                    assetUrl={assetUrl}
                    mimeType={assetMimeType}
                  />
                </CardContent>
              </Card>
            </div>
          </div>
        </SheetContent>
      </Sheet>
    </section>
  );
}
