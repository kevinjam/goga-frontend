import { Badge } from "@/components/ui";
import type { PaymentStatus } from "@/types/payments";

export function PaymentStatusBadge({ status }: { status: PaymentStatus }) {
  if (status === "MATCHED") return <Badge variant="success" showDot>Matched</Badge>;
  if (status === "RECEIPTED") return <Badge variant="default" showDot>Receipted</Badge>;
  if (status === "NEEDS_REVIEW") return <Badge variant="warning" showDot>Discrepancy</Badge>;
  if (status === "FAILED") return <Badge variant="danger" showDot>Failed</Badge>;
  return <Badge variant="warning" showDot>Pending</Badge>;
}
