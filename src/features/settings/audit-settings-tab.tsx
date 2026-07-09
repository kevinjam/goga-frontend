"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { settingsService } from "@/services/api/settingsService";
import type { AuditAction, AuditLogItem } from "@/types/settings";
import {
  Badge,
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Skeleton,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "@/components/ui";

const ACTION_LABELS: Record<AuditAction, string> = {
  ADMIN_USER_CREATED: "User Created",
  WELCOME_EMAIL_SENT: "Welcome Email Sent",
  WELCOME_EMAIL_FAILED: "Welcome Email Failed",
  WELCOME_EMAIL_RESENT: "Welcome Email Resent",
  PASSWORD_CHANGED: "Password Changed",
  USER_DEACTIVATED: "User Deactivated",
  USER_ACTIVATED: "User Activated",
  PASSWORD_RESET_REQUESTED: "Password Reset Requested"
};

function actionBadgeVariant(action: AuditAction) {
  if (action.includes("FAILED")) return "danger" as const;
  if (action.includes("DEACTIVATED")) return "warning" as const;
  return "secondary" as const;
}

export function AuditSettingsTab() {
  const [logs, setLogs] = useState<AuditLogItem[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [action, setAction] = useState<AuditAction | "ALL">("ALL");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const controller = new AbortController();
    setIsLoading(true);
    settingsService
      .getAuditLogs(
        {
          page,
          limit: 15,
          action: action === "ALL" ? undefined : action
        },
        controller.signal
      )
      .then((response) => {
        if (controller.signal.aborted) return;
        setLogs(response.data);
        setTotalPages(Math.max(response.meta.totalPages, 1));
        setTotal(response.meta.total);
      })
      .catch(() => {
        if (controller.signal.aborted) return;
        toast.error("Failed to load audit logs.");
      })
      .finally(() => {
        if (controller.signal.aborted) return;
        setIsLoading(false);
      });
    return () => controller.abort();
  }, [page, action]);

  return (
    <Card className="flex h-full min-h-0 flex-col overflow-hidden">
      <CardHeader className="flex flex-row items-start justify-between gap-4 pb-3">
        <div>
          <CardTitle className="text-base">Audit Log</CardTitle>
          <CardDescription>User creation, email delivery, and password events.</CardDescription>
        </div>
        <Select
          value={action}
          onValueChange={(value: AuditAction | "ALL") => {
            setAction(value);
            setPage(1);
          }}
        >
          <SelectTrigger className="w-[220px]"><SelectValue placeholder="Filter action" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">All actions</SelectItem>
            {Object.entries(ACTION_LABELS).map(([value, label]) => (
              <SelectItem key={value} value={value}>{label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </CardHeader>
      <CardContent className="min-h-0 flex-1 overflow-auto p-0">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>When</TableHead>
              <TableHead>Action</TableHead>
              <TableHead>Actor</TableHead>
              <TableHead>Target</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              Array.from({ length: 8 }).map((_, idx) => (
                <TableRow key={idx}>
                  {Array.from({ length: 4 }).map((__, cellIdx) => (
                    <TableCell key={cellIdx}><Skeleton className="h-4 w-24" /></TableCell>
                  ))}
                </TableRow>
              ))
            ) : logs.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="py-8 text-center text-muted-foreground">
                  No audit events found.
                </TableCell>
              </TableRow>
            ) : (
              logs.map((log) => (
                <TableRow key={log.id}>
                  <TableCell className="whitespace-nowrap text-sm">
                    {new Date(log.createdAt).toLocaleString()}
                  </TableCell>
                  <TableCell>
                    <Badge variant={actionBadgeVariant(log.action)}>
                      {ACTION_LABELS[log.action]}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-sm">
                    {log.actorName ?? log.actorEmail ?? "System"}
                  </TableCell>
                  <TableCell className="text-sm">
                    {log.targetName ?? log.targetEmail ?? "—"}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </CardContent>
      <div className="flex items-center justify-between border-t border-border px-4 py-3">
        <p className="text-sm text-muted-foreground">Page {page} of {totalPages} • {total} events</p>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" disabled={page <= 1 || isLoading} onClick={() => setPage((p) => p - 1)}>
            Previous
          </Button>
          <Button variant="outline" size="sm" disabled={page >= totalPages || isLoading} onClick={() => setPage((p) => p + 1)}>
            Next
          </Button>
        </div>
      </div>
    </Card>
  );
}
