"use client";

import Link from "next/link";
import { FileWarning } from "lucide-react";
import { Button, Skeleton } from "@/components/ui";

interface ReceiptViewerProps {
  isLoading: boolean;
  assetUrl: string | null;
  mimeType: string | null;
}

export function ReceiptViewer({ isLoading, assetUrl, mimeType }: ReceiptViewerProps) {
  const previewClassName =
    "h-[min(420px,60vh)] min-h-[240px] w-full rounded-md border border-border";

  if (isLoading) {
    return <Skeleton className={`${previewClassName} object-contain`} />;
  }

  if (!assetUrl) {
    return (
      <div className={`flex flex-col items-center justify-center border-dashed bg-muted/20 p-6 text-center ${previewClassName}`}>
        <FileWarning className="mb-3 h-8 w-8 text-muted-foreground" />
        <p className="text-sm font-medium">No Receipt Linked</p>
        <p className="mt-1 text-xs text-muted-foreground">
          This transaction has no matched receipt asset yet.
        </p>
        <Link href="/dashboard/payments/upload">
          <Button className="mt-3" size="sm" variant="outline">
            Upload Receipt
          </Button>
        </Link>
      </div>
    );
  }

  const isImage = mimeType?.startsWith("image/");

  if (isImage) {
    return (
      <img
        src={assetUrl}
        alt="Receipt"
        className={`${previewClassName} object-contain`}
      />
    );
  }

  return (
    <iframe
      src={assetUrl}
      title="Receipt document"
      className={previewClassName}
    />
  );
}
