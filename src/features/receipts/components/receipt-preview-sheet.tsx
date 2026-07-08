"use client";

import { Download } from "lucide-react";
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
import type { EnrichedReceiptRecord } from "@/types/receipts";

function MetaField({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs uppercase tracking-wide text-muted-foreground">{label}</p>
      <p className="text-sm font-medium">{value}</p>
    </div>
  );
}

export function ReceiptPreviewSheet({
  open,
  row,
  isLoading,
  assetUrl,
  mimeType,
  downloadingId,
  onOpenChange,
  onDownload
}: {
  open: boolean;
  row: EnrichedReceiptRecord | null;
  isLoading: boolean;
  assetUrl: string | null;
  mimeType: string | null;
  downloadingId: string | null;
  onOpenChange: (open: boolean) => void;
  onDownload: (id: string) => Promise<void>;
}) {
  const isImage = mimeType?.startsWith("image/");
  const previewClassName =
    "h-[min(520px,65vh)] min-h-[240px] w-full rounded-md border border-border";

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-[92vw] max-w-[1100px] overflow-y-auto p-4 sm:p-6">
        <div className="space-y-5">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <h2 className="text-xl font-semibold">Receipt Preview</h2>
              <p className="text-sm text-muted-foreground">
                {row ? `Receipt ${row.receiptNumber}` : "Loading..."}
              </p>
            </div>
            {row ? (
              <Button
                variant="outline"
                className="min-h-10 w-full sm:w-auto"
                disabled={downloadingId === row.id}
                onClick={() => void onDownload(row.id)}
              >
                <Download className="mr-2 h-4 w-4" />
                {downloadingId === row.id ? "Downloading..." : "Download PDF"}
              </Button>
            ) : null}
          </div>

          <div className="grid gap-5 lg:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Extracted Metadata</CardTitle>
              </CardHeader>
              <CardContent className="grid gap-4 sm:grid-cols-2">
                {isLoading || !row ? (
                  <>
                    <Skeleton className="h-10" />
                    <Skeleton className="h-10" />
                    <Skeleton className="h-10" />
                    <Skeleton className="h-10" />
                  </>
                ) : (
                  <>
                    <MetaField label="Receipt Number" value={row.receiptNumber} />
                    <MetaField
                      label="Processed At"
                      value={new Date(row.createdAt).toLocaleString()}
                    />
                    <MetaField label="Source" value={row.source} />
                    <MetaField
                      label="Total Amount"
                      value={row.payment ? row.payment.amount.toLocaleString() : "—"}
                    />
                    <MetaField
                      label="Vendor / Payee"
                      value={row.payment?.receivedFrom ?? "—"}
                    />
                    <MetaField
                      label="Invoice / Reference"
                      value={row.payment?.transactionReference ?? row.receiptNumber}
                    />
                    <MetaField
                      label="Category"
                      value={row.payment?.purpose ?? "General"}
                    />
                    <div>
                      <p className="text-xs uppercase tracking-wide text-muted-foreground">
                        Email Status
                      </p>
                      <Badge variant={row.emailStatus === "SENT" ? "success" : row.emailStatus === "FAILED" ? "danger" : "warning"}>
                        {row.emailStatus}
                      </Badge>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base">Original File</CardTitle>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <Skeleton className={previewClassName} />
                ) : assetUrl ? (
                  isImage ? (
                    <img
                      src={assetUrl}
                      alt="Receipt asset"
                      className={`${previewClassName} object-contain`}
                    />
                  ) : (
                    <iframe
                      src={assetUrl}
                      title="Receipt PDF"
                      className={previewClassName}
                    />
                  )
                ) : (
                  <div className={`flex items-center justify-center border-dashed text-sm text-muted-foreground ${previewClassName}`}>
                    No file preview available.
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
