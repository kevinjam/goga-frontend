"use client";

import {
  Badge,
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
import type { ParsedPaymentRow } from "@/types/payments-upload";

export function PreviewTable({ rows }: { rows: ParsedPaymentRow[] }) {
  const previewRows = rows.slice(0, 8);

  return (
    <div className="rounded-lg border border-border">
      <div className="space-y-3 p-3 md:hidden">
        {previewRows.map((row) => (
          <MobileDataCard key={row.rowNumber}>
            <div className="space-y-3">
              <div className="flex items-center justify-between gap-2">
                <p className="text-sm font-semibold">Row {row.rowNumber}</p>
                <Badge variant={row.isValid ? "success" : "danger"}>
                  {row.isValid ? "Valid" : "Invalid"}
                </Badge>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <MobileDataCardField label="Date" value={row.date} />
                <MobileDataCardField label="Amount" value={row.amount.toLocaleString()} />
                <MobileDataCardField label="Received From" value={row.receivedFrom} />
                <MobileDataCardField label="Method" value={row.method} />
                <MobileDataCardField label="Purpose" value={row.purpose} />
                <MobileDataCardField
                  label="Reference"
                  value={row.transactionReference || "—"}
                />
              </div>
            </div>
          </MobileDataCard>
        ))}
      </div>

      <div className="hidden md:block">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Row</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Received From</TableHead>
              <TableHead>Amount</TableHead>
              <TableHead className="hidden lg:table-cell">Method</TableHead>
              <TableHead className="hidden lg:table-cell">Purpose</TableHead>
              <TableHead className="hidden xl:table-cell">Reference</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {previewRows.map((row) => (
              <TableRow key={row.rowNumber}>
                <TableCell>{row.rowNumber}</TableCell>
                <TableCell>{row.date}</TableCell>
                <TableCell>{row.receivedFrom}</TableCell>
                <TableCell>{row.amount.toLocaleString()}</TableCell>
                <TableCell className="hidden lg:table-cell">{row.method}</TableCell>
                <TableCell className="hidden lg:table-cell">{row.purpose}</TableCell>
                <TableCell className="hidden xl:table-cell">
                  {row.transactionReference || "—"}
                </TableCell>
                <TableCell>
                  <Badge variant={row.isValid ? "success" : "danger"}>
                    {row.isValid ? "Valid" : "Invalid"}
                  </Badge>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {rows.length > previewRows.length ? (
        <p className="border-t border-border p-3 text-xs text-muted-foreground">
          Showing {previewRows.length} of {rows.length} rows.
        </p>
      ) : null}
    </div>
  );
}
