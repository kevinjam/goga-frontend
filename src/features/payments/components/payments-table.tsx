"use client";

import {
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
import { PaymentStatusBadge } from "@/features/payments/components/payment-status-badge";
import type { PaymentRecord } from "@/types/payments";

interface PaymentsTableProps {
  rows: PaymentRecord[];
  isLoading: boolean;
  isRefreshing?: boolean;
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  onLimitChange: (limit: number) => void;
  onSelectRow: (paymentId: string) => void;
}

export function PaymentsTable({
  rows,
  isLoading,
  isRefreshing = false,
  page,
  limit,
  total,
  totalPages,
  onPageChange,
  onLimitChange,
  onSelectRow
}: PaymentsTableProps) {
  return (
    <div className="relative rounded-lg border border-border bg-card">
      {isRefreshing ? (
        <div className="absolute inset-x-0 top-0 z-10 h-0.5 overflow-hidden bg-muted">
          <div className="h-full w-1/3 animate-pulse bg-primary" />
        </div>
      ) : null}

      <div className="space-y-3 p-3 md:hidden">
        {isLoading ? (
          Array.from({ length: 4 }).map((_, index) => (
            <Skeleton key={index} className="h-32 w-full rounded-lg" />
          ))
        ) : rows.length === 0 ? (
          <p className="py-10 text-center text-sm text-muted-foreground">
            No payments found.
          </p>
        ) : (
          rows.map((row) => (
            <MobileDataCard key={row.id} onClick={() => onSelectRow(row.id)}>
              <div className="space-y-3">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold">
                      {row.transactionReference}
                    </p>
                    <p className="truncate text-xs text-muted-foreground">
                      {row.receivedFrom ?? "—"}
                    </p>
                  </div>
                  <PaymentStatusBadge status={row.status} />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <MobileDataCardField
                    label="Date"
                    value={new Date(row.date).toLocaleDateString()}
                  />
                  <MobileDataCardField
                    label="Amount"
                    value={row.amount.toLocaleString()}
                  />
                  <MobileDataCardField
                    label="Method"
                    value={row.method.replaceAll("_", " ")}
                  />
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
              <TableHead>Date</TableHead>
              <TableHead>Reference</TableHead>
              <TableHead className="hidden lg:table-cell">Vendor / Employee</TableHead>
              <TableHead>Amount</TableHead>
              <TableHead className="hidden xl:table-cell">Method</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody className={isRefreshing ? "opacity-70 transition-opacity" : undefined}>
            {isLoading ? (
              Array.from({ length: 8 }).map((_, index) => (
                <TableRow key={index}>
                  <TableCell><Skeleton className="h-4 w-20" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                  <TableCell className="hidden lg:table-cell"><Skeleton className="h-4 w-40" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-20" /></TableCell>
                  <TableCell className="hidden xl:table-cell"><Skeleton className="h-4 w-20" /></TableCell>
                  <TableCell><Skeleton className="h-5 w-24 rounded-full" /></TableCell>
                </TableRow>
              ))
            ) : rows.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="py-10 text-center text-muted-foreground">
                  No payments found.
                </TableCell>
              </TableRow>
            ) : (
              rows.map((row) => (
                <TableRow
                  key={row.id}
                  onClick={() => onSelectRow(row.id)}
                  className="cursor-pointer"
                >
                  <TableCell>{new Date(row.date).toLocaleDateString()}</TableCell>
                  <TableCell className="font-medium">{row.transactionReference}</TableCell>
                  <TableCell className="hidden lg:table-cell">{row.receivedFrom ?? "—"}</TableCell>
                  <TableCell>{row.amount.toLocaleString()}</TableCell>
                  <TableCell className="hidden xl:table-cell">{row.method.replaceAll("_", " ")}</TableCell>
                  <TableCell><PaymentStatusBadge status={row.status} /></TableCell>
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
