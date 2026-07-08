"use client";

import { useEffect } from "react";
import { BrandedStatusPage } from "@/components/branding/branded-status-page";

export default function Error({
  error,
  reset
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <BrandedStatusPage
      title="Something went wrong"
      description="An unexpected error occurred while loading this page."
      actionLabel="Go to Dashboard"
      actionHref="/dashboard"
      onRetry={reset}
    />
  );
}
