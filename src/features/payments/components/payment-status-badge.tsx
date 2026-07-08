import { Badge } from "@/components/ui";
import type { PaymentStatus } from "@/types/payments";

export function PaymentStatusBadge({ status }: { status: PaymentStatus }) {
  if (status === "MATCHED") return <Badge variant="success">Matched</Badge>;
  if (status === "RECEIPTED") return <Badge variant="default">Receipted</Badge>;
  if (status === "NEEDS_REVIEW") return <Badge variant="warning">Discrepancy</Badge>;
  if (status === "FAILED") return <Badge variant="danger">Failed</Badge>;
  return <Badge variant="secondary">Pending</Badge>;
}
