"use client";

import { Download, Mail } from "lucide-react";
import {
  Badge,
  Button,
  Skeleton,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "@/components/ui";
import {
  MobileDataCard,
  MobileDataCardField
} from "@/components/shared/mobile-data-card";
import { TablePaginationFooter } from "@/components/shared/table-pagination-footer";
import type { EnrichedReceiptRecord } from "@/types/receipts";

interface ReceiptsTableProps {
  rows: EnrichedReceiptRecord[];
  isLoading: boolean;
  isRefreshing?: boolean;
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  downloadingId: string | null;
  resendingId: string | null;
  onPageChange: (page: number) => void;
  onLimitChange: (limit: number) => void;
  onRowClick: (row: EnrichedReceiptRecord) => void;
  onDownload: (id: string) => Promise<void>;
  onResend: (id: string) => Promise<void>;
}

function EmailStatusBadge({ status }: { status: EnrichedReceiptRecord["emailStatus"] }) {
  if (status === "SENT") return <Badge variant="success">Sent</Badge>;
  if (status === "FAILED") return <Badge variant="danger">Failed</Badge>;
  return <Badge variant="warning">Pending</Badge>;
}

export function ReceiptsTable({
  rows,
  isLoading,
  isRefreshing = false,
  page,
  limit,
  total,
  totalPages,
  downloadingId,
  resendingId,
  onPageChange,
  onLimitChange,
  onRowClick,
  onDownload,
  onResend
}: ReceiptsTableProps) {
  return (
    <div className="relative rounded-lg border border-border bg-card">
      {isRefreshing ? (
        <div className="absolute inset-x-0 top-0 z-10 h-0.5 overflow-hidden bg-muted">
          <div className="h-full w-1/3 animate-pulse bg-primary" />
        </div>
      ) : null}

      <div className="space-y-3 p-3 md:hidden">
        {isLoading ? (
          Array.from({ length: 4 }).map((_, idx) => (
            <Skeleton key={idx} className="h-40 w-full rounded-lg" />
          ))
        ) : rows.length === 0 ? (
          <p className="py-10 text-center text-sm text-muted-foreground">
            No receipts found.
          </p>
        ) : (
          rows.map((row) => (
            <MobileDataCard key={row.id} onClick={() => onRowClick(row)}>
              <div className="space-y-3">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold">{row.receiptNumber}</p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(row.createdAt).toLocaleString()}
                    </p>
                  </div>
                  <EmailStatusBadge status={row.emailStatus} />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <MobileDataCardField label="Source" value={row.source} />
                  <MobileDataCardField
                    label="Amount"
                    value={row.payment ? row.payment.amount.toLocaleString() : "—"}
                  />
                </div>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    className="min-h-10 flex-1"
                    disabled={downloadingId === row.id}
                    onClick={(event) => {
                      event.stopPropagation();
                      void onDownload(row.id);
                    }}
                  >
                    <Download className="mr-1 h-4 w-4" />
                    {downloadingId === row.id ? "..." : "PDF"}
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="min-h-10 flex-1"
                    disabled={resendingId === row.id}
                    onClick={(event) => {
                      event.stopPropagation();
                      void onResend(row.id);
                    }}
                  >
                    <Mail className="mr-1 h-4 w-4" />
                    {resendingId === row.id ? "..." : "Resend"}
                  </Button>
                </div>
              </div>
            </MobileDataCard>
          ))
        )}
      </div>

      <div className="hidden md:block">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Receipt #</TableHead>
              <TableHead className="hidden lg:table-cell">Processed At</TableHead>
              <TableHead>Source</TableHead>
              <TableHead>Total Amount</TableHead>
              <TableHead className="hidden xl:table-cell">Email</TableHead>
              <TableHead className="w-[180px]">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody className={isRefreshing ? "opacity-70 transition-opacity" : undefined}>
            {isLoading ? (
              Array.from({ length: 8 }).map((_, idx) => (
                <TableRow key={idx}>
                  <TableCell><Skeleton className="h-4 w-28" /></TableCell>
                  <TableCell className="hidden lg:table-cell"><Skeleton className="h-4 w-24" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-20" /></TableCell>
                  <TableCell className="hidden xl:table-cell"><Skeleton className="h-5 w-16 rounded-full" /></TableCell>
                  <TableCell><Skeleton className="h-8 w-36" /></TableCell>
                </TableRow>
              ))
            ) : rows.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="py-10 text-center text-muted-foreground">
                  No receipts found.
                </TableCell>
              </TableRow>
            ) : (
              rows.map((row) => (
                <TableRow key={row.id} className="cursor-pointer" onClick={() => onRowClick(row)}>
                  <TableCell className="font-medium">{row.receiptNumber}</TableCell>
                  <TableCell className="hidden lg:table-cell">
                    {new Date(row.createdAt).toLocaleString()}
                  </TableCell>
                  <TableCell>{row.source}</TableCell>
                  <TableCell>
                    {row.payment ? row.payment.amount.toLocaleString() : "—"}
                  </TableCell>
                  <TableCell className="hidden xl:table-cell">
                    <EmailStatusBadge status={row.emailStatus} />
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        disabled={downloadingId === row.id}
                        onClick={(event) => {
                          event.stopPropagation();
                          void onDownload(row.id);
                        }}
                      >
                        <Download className="mr-1 h-4 w-4" />
                        {downloadingId === row.id ? "Downloading..." : "PDF"}
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        disabled={resendingId === row.id}
                        onClick={(event) => {
                          event.stopPropagation();
                          void onResend(row.id);
                        }}
                      >
                        <Mail className="mr-1 h-4 w-4" />
                        {resendingId === row.id ? "Sending..." : "Resend"}
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <TablePaginationFooter
        page={page}
        limit={limit}
        totalPages={totalPages}
        total={total}
        isRefreshing={isRefreshing}
        onPageChange={onPageChange}
        onLimitChange={onLimitChange}
      />
    </div>
  );
}
