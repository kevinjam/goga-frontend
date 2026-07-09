"use client";

import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { receiptsService } from "@/services/api/receiptsService";
import { settingsService } from "@/services/api/settingsService";
import type { EmailLogItem } from "@/types/settings";
import {
  Badge,
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Skeleton,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "@/components/ui";

function emailStatusBadgeVariant(status: EmailLogItem["status"]) {
  if (status === "SENT") return "success" as const;
  if (status === "FAILED") return "danger" as const;
  return "warning" as const;
}

export function EmailLogsSettingsTab() {
  const [emailLogs, setEmailLogs] = useState<EmailLogItem[]>([]);
  const [emailPage, setEmailPage] = useState(1);
  const [emailTotalPages, setEmailTotalPages] = useState(1);
  const [emailTotal, setEmailTotal] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [resendingId, setResendingId] = useState<string | null>(null);
  const hasLoadedOnceRef = useRef(false);

  useEffect(() => {
    const controller = new AbortController();
    if (hasLoadedOnceRef.current) setIsLoading(true);
    settingsService
      .getEmailLogs({ page: emailPage, limit: 12 }, controller.signal)
      .then((response) => {
        if (controller.signal.aborted) return;
        setEmailLogs(response.data);
        setEmailTotalPages(Math.max(response.meta.totalPages || 1, 1));
        setEmailTotal(response.meta.total);
        hasLoadedOnceRef.current = true;
      })
      .catch(() => {
        if (controller.signal.aborted) return;
        toast.error("Failed to load email logs.");
      })
      .finally(() => {
        if (controller.signal.aborted) return;
        setIsLoading(false);
      });
    return () => controller.abort();
  }, [emailPage]);

  async function handleResend(id: string) {
    try {
      setResendingId(id);
      await receiptsService.resendReceiptEmail(id);
      toast.success("Email resend requested.");
      const response = await settingsService.getEmailLogs({ page: emailPage, limit: 12 });
      setEmailLogs(response.data);
    } catch {
      toast.error("Failed to resend email.");
    } finally {
      setResendingId(null);
    }
  }

  return (
    <Card className="flex h-full min-h-0 flex-col overflow-hidden">
      <CardHeader className="pb-3">
        <CardTitle className="text-base">Receipt Email Logs</CardTitle>
        <CardDescription>Delivery status for receipt emails.</CardDescription>
      </CardHeader>
      <CardContent className="min-h-0 flex-1 overflow-auto p-0">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Receipt #</TableHead>
              <TableHead>Recipient</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Sent At</TableHead>
              <TableHead className="w-[100px]">Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              Array.from({ length: 8 }).map((_, idx) => (
                <TableRow key={idx}>
                  {Array.from({ length: 5 }).map((__, cellIdx) => (
                    <TableCell key={cellIdx}><Skeleton className="h-4 w-20" /></TableCell>
                  ))}
                </TableRow>
              ))
            ) : emailLogs.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="py-8 text-center text-muted-foreground">
                  No email logs found.
                </TableCell>
              </TableRow>
            ) : (
              emailLogs.map((log) => (
                <TableRow key={log.id}>
                  <TableCell className="font-medium">{log.receiptNumber}</TableCell>
                  <TableCell>{log.recipient ?? "—"}</TableCell>
                  <TableCell>
                    <Badge variant={emailStatusBadgeVariant(log.status)}>{log.status}</Badge>
                  </TableCell>
                  <TableCell>
                    {log.sentAt ? new Date(log.sentAt).toLocaleString() : "—"}
                  </TableCell>
                  <TableCell>
                    <Button
                      size="sm"
                      variant="outline"
                      disabled={resendingId === log.id}
                      onClick={() => void handleResend(log.id)}
                    >
                      {resendingId === log.id ? "..." : "Resend"}
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </CardContent>
      <div className="flex items-center justify-between border-t border-border px-4 py-3">
        <p className="text-sm text-muted-foreground">Page {emailPage} of {emailTotalPages} • {emailTotal}</p>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" disabled={emailPage <= 1 || isLoading} onClick={() => setEmailPage((p) => p - 1)}>
            Previous
          </Button>
          <Button variant="outline" size="sm" disabled={emailPage >= emailTotalPages || isLoading} onClick={() => setEmailPage((p) => p + 1)}>
            Next
          </Button>
        </div>
      </div>
    </Card>
  );
}
