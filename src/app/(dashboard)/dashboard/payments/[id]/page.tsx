"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { AlertCircle, FileWarning } from "lucide-react";
import { toast } from "sonner";
import {
  Alert,
  AlertDescription,
  AlertTitle,
  Badge,
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Skeleton
} from "@/components/ui";
import { paymentsService } from "@/services/api/paymentsService";
import type { PaymentRecord, ReceiptRecord } from "@/types/payments";
import { PaymentStatusBadge } from "@/features/payments/components/payment-status-badge";

function DetailItem({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs uppercase tracking-wide text-muted-foreground">{label}</p>
      <p className="text-sm font-medium">{value}</p>
    </div>
  );
}

export default function PaymentDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [payment, setPayment] = useState<PaymentRecord | null>(null);
  const [receipt, setReceipt] = useState<ReceiptRecord | null>(null);
  const [assetUrl, setAssetUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    let localAssetUrl: string | null = null;

    async function loadData() {
      setIsLoading(true);
      try {
        const paymentData = await paymentsService.getPaymentDetails(id);
        if (!mounted) return;
        setPayment(paymentData);

        const receiptData = await paymentsService.findReceiptByPaymentId(id);
        if (!mounted) return;
        setReceipt(receiptData);

        if (receiptData) {
          const asset = await paymentsService.getReceiptAssetUrl(receiptData.id);
          localAssetUrl = asset.url;
          if (!mounted) return;
          setAssetUrl(localAssetUrl);
        }
      } catch {
        toast.error("Failed to load payment details");
      } finally {
        if (mounted) setIsLoading(false);
      }
    }

    loadData();

    return () => {
      mounted = false;
      if (localAssetUrl) URL.revokeObjectURL(localAssetUrl);
    };
  }, [id]);

  if (isLoading) {
    return (
      <section className="space-y-4">
        <Skeleton className="h-8 w-60" />
        <div className="grid gap-4 lg:grid-cols-2">
          <Skeleton className="h-[500px]" />
          <Skeleton className="h-[500px]" />
        </div>
      </section>
    );
  }

  if (!payment) {
    return (
      <Alert className="border-danger/40 bg-danger/5">
        <AlertCircle className="mb-2 h-4 w-4" />
        <AlertTitle>Payment not found</AlertTitle>
        <AlertDescription>
          This record may have been removed or is unavailable.
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <section className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold md:text-2xl">Payment Intelligence</h1>
          <p className="text-sm text-muted-foreground">
            Reference: {payment.transactionReference}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <PaymentStatusBadge status={payment.status} />
          <Link href="/dashboard/payments">
            <Button variant="outline">Back to Ledger</Button>
          </Link>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Transaction Metadata</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4 sm:grid-cols-2">
            <DetailItem
              label="Transaction Date"
              value={new Date(payment.date).toLocaleDateString()}
            />
            <DetailItem
              label="Normalized Amount"
              value={payment.amount.toLocaleString()}
            />
            <DetailItem
              label="Extracted Tax"
              value={(payment.amount * 0.18).toLocaleString()}
            />
            <DetailItem
              label="Cleared Status"
              value={payment.status.replaceAll("_", " ")}
            />
            <DetailItem label="Matched Payee" value={payment.receivedFrom ?? "Unknown"} />
            <DetailItem label="Method" value={payment.method.replaceAll("_", " ")} />
            <DetailItem label="Purpose" value={payment.purpose ?? "—"} />
            <DetailItem
              label="Member Match"
              value={payment.memberId ? "Matched" : "Pending manual pairing"}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Document Viewer</CardTitle>
          </CardHeader>
          <CardContent>
            {assetUrl ? (
              <iframe
                src={assetUrl}
                title="Receipt Asset"
                className="h-[min(560px,65vh)] min-h-[280px] w-full rounded-md border border-border"
              />
            ) : (
              <div className="flex h-[min(560px,65vh)] min-h-[280px] flex-col items-center justify-center rounded-md border border-dashed border-border bg-muted/20 p-6 text-center">
                <FileWarning className="mb-3 h-8 w-8 text-muted-foreground" />
                <p className="text-sm font-medium">Missing File Asset</p>
                <p className="mt-1 text-xs text-muted-foreground">
                  No receipt is currently matched to this payment.
                </p>
                <div className="mt-3 flex gap-2">
                  <Badge variant="secondary">Manual pairing required</Badge>
                  <Link href="/dashboard/payments/upload">
                    <Button size="sm" variant="outline">
                      Pair via Upload
                    </Button>
                  </Link>
                </div>
              </div>
            )}

            {receipt ? (
              <p className="mt-3 text-xs text-muted-foreground">
                Receipt ID: {receipt.id} • Number: {receipt.receiptNumber}
              </p>
            ) : null}
          </CardContent>
        </Card>
      </div>
    </section>
  );
}
