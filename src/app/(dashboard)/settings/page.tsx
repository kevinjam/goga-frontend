"use client";

import { useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { useAuth } from "@/context/AuthContext";
import { authService } from "@/services/api/authService";
import { receiptsService } from "@/services/api/receiptsService";
import { settingsService } from "@/services/api/settingsService";
import type { UserRole } from "@/types/auth";
import type { EmailLogItem, SettingsUser } from "@/types/settings";
import { Alert, AlertDescription, AlertTitle, Badge, Button, Card, CardContent, CardDescription, CardHeader, CardTitle, Input, Label, Select, SelectContent, SelectItem, SelectTrigger, SelectValue, Skeleton, Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui";
import { MobileDataCard, MobileDataCardField } from "@/components/shared/mobile-data-card";

const createAdminSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Enter a valid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  role: z.enum(["ADMIN", "FINANCE_OFFICER", "VIEWER"])
});

type CreateAdminSchema = z.infer<typeof createAdminSchema>;

function emailStatusBadgeVariant(status: EmailLogItem["status"]) {
  if (status === "SENT") return "success" as const;
  if (status === "FAILED") return "danger" as const;
  return "warning" as const;
}

export default function SettingsPage() {
  const { user } = useAuth();
  const [lastCreatedAdmin, setLastCreatedAdmin] = useState<string | null>(null);
  const [users, setUsers] = useState<SettingsUser[]>([]);
  const [isUsersLoading, setIsUsersLoading] = useState(true);
  const [emailLogs, setEmailLogs] = useState<EmailLogItem[]>([]);
  const [emailPage, setEmailPage] = useState(1);
  const [emailLimit, setEmailLimit] = useState(10);
  const [emailTotalPages, setEmailTotalPages] = useState(1);
  const [emailTotal, setEmailTotal] = useState(0);
  const [isEmailInitialLoading, setIsEmailInitialLoading] = useState(true);
  const [isEmailRefreshing, setIsEmailRefreshing] = useState(false);
  const [resendingId, setResendingId] = useState<string | null>(null);
  const hasLoadedEmailOnceRef = useRef(false);

  const form = useForm<CreateAdminSchema>({
    resolver: zodResolver(createAdminSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      role: "ADMIN"
    }
  });

  const isSuperAdmin = user?.role === "ADMIN";

  useEffect(() => {
    const controller = new AbortController();
    setIsUsersLoading(true);

    settingsService
      .getUsers(controller.signal)
      .then((rows) => {
        if (controller.signal.aborted) return;
        setUsers(rows);
      })
      .catch(() => {
        if (controller.signal.aborted) return;
        toast.error("Failed to load users.");
      })
      .finally(() => {
        if (controller.signal.aborted) return;
        setIsUsersLoading(false);
      });

    return () => controller.abort();
  }, []);

  useEffect(() => {
    const controller = new AbortController();

    if (hasLoadedEmailOnceRef.current) {
      setIsEmailRefreshing(true);
    } else {
      setIsEmailInitialLoading(true);
    }

    settingsService
      .getEmailLogs({ page: emailPage, limit: emailLimit }, controller.signal)
      .then((response) => {
        if (controller.signal.aborted) return;
        setEmailLogs(response.data);
        setEmailTotalPages(Math.max(response.meta.totalPages || 1, 1));
        setEmailTotal(response.meta.total);
        hasLoadedEmailOnceRef.current = true;
      })
      .catch(() => {
        if (controller.signal.aborted) return;
        toast.error("Failed to load email logs.");
      })
      .finally(() => {
        if (controller.signal.aborted) return;
        setIsEmailInitialLoading(false);
        setIsEmailRefreshing(false);
      });

    return () => controller.abort();
  }, [emailPage, emailLimit]);

  async function onSubmit(values: CreateAdminSchema) {
    try {
      const created = await authService.registerUser({
        name: values.name.trim(),
        email: values.email.trim().toLowerCase(),
        password: values.password,
        role: values.role
      });

      setLastCreatedAdmin(created.email);
      form.reset();
      toast.success("User account created successfully.");
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Failed to create admin user.";
      toast.error(message);
    }
  }

  async function handleResend(id: string) {
    try {
      setResendingId(id);
      await receiptsService.resendReceiptEmail(id);
      toast.success("Email resend requested successfully.");
      const response = await settingsService.getEmailLogs({
        page: emailPage,
        limit: emailLimit
      });
      setEmailLogs(response.data);
      setEmailTotalPages(Math.max(response.meta.totalPages || 1, 1));
      setEmailTotal(response.meta.total);
    } catch {
      toast.error("Failed to resend email.");
    } finally {
      setResendingId(null);
    }
  }

  return (
    <section className="space-y-6">
      {!isSuperAdmin ? (
        <Alert>
          <AlertTitle>Restricted Access</AlertTitle>
          <AlertDescription>
            Only Super Admin (ADMIN role) can create admin accounts and manage
            administrative settings.
          </AlertDescription>
        </Alert>
      ) : (
        <>
          <div className="grid gap-6 xl:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Create Admin User</CardTitle>
                <CardDescription>
                  Create a new account and choose its role.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form
                  className="space-y-4"
                  onSubmit={form.handleSubmit(onSubmit)}
                  noValidate
                >
                  <div className="space-y-2">
                    <Label htmlFor="name">Full Name</Label>
                    <Input
                      id="name"
                      placeholder="e.g. Jane Admin"
                      autoComplete="name"
                      {...form.register("name")}
                    />
                    {form.formState.errors.name ? (
                      <p className="text-sm text-red-600">
                        {form.formState.errors.name.message}
                      </p>
                    ) : null}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="admin@goga.local"
                      autoComplete="email"
                      {...form.register("email")}
                    />
                    {form.formState.errors.email ? (
                      <p className="text-sm text-red-600">
                        {form.formState.errors.email.message}
                      </p>
                    ) : null}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="role">Role</Label>
                    <Select
                      value={form.watch("role")}
                      onValueChange={(value: UserRole) =>
                        form.setValue("role", value, { shouldValidate: true })
                      }
                    >
                      <SelectTrigger id="role">
                        <SelectValue placeholder="Select role" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="ADMIN">Admin</SelectItem>
                        <SelectItem value="FINANCE_OFFICER">Finance Officer</SelectItem>
                        <SelectItem value="VIEWER">Viewer</SelectItem>
                      </SelectContent>
                    </Select>
                    {form.formState.errors.role ? (
                      <p className="text-sm text-red-600">
                        {form.formState.errors.role.message}
                      </p>
                    ) : null}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="password">Temporary Password</Label>
                    <Input
                      id="password"
                      type="password"
                      placeholder="Minimum 8 characters"
                      autoComplete="new-password"
                      {...form.register("password")}
                    />
                    {form.formState.errors.password ? (
                      <p className="text-sm text-red-600">
                        {form.formState.errors.password.message}
                      </p>
                    ) : null}
                  </div>

                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                    <Button type="submit" className="min-h-10 w-full sm:w-auto" disabled={form.formState.isSubmitting}>
                      {form.formState.isSubmitting ? "Creating..." : "Create User"}
                    </Button>
                    {lastCreatedAdmin ? (
                      <span className="text-sm text-muted-foreground">
                        Last created: {lastCreatedAdmin}
                      </span>
                    ) : null}
                  </div>
                </form>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>System Users</CardTitle>
                <CardDescription>
                  Accounts currently available in the system.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="rounded-lg border border-border bg-card">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Email</TableHead>
                        <TableHead>Role</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {isUsersLoading ? (
                        Array.from({ length: 5 }).map((_, idx) => (
                          <TableRow key={idx}>
                            <TableCell><Skeleton className="h-4 w-52" /></TableCell>
                            <TableCell><Skeleton className="h-5 w-24 rounded-full" /></TableCell>
                          </TableRow>
                        ))
                      ) : users.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={2} className="py-8 text-center text-muted-foreground">
                            No users available.
                          </TableCell>
                        </TableRow>
                      ) : (
                        users.map((entry) => (
                          <TableRow key={entry.id}>
                            <TableCell className="font-medium">{entry.email}</TableCell>
                            <TableCell>
                              <Badge
                                variant={
                                  entry.role === "ADMIN"
                                    ? "success"
                                    : entry.role === "FINANCE_OFFICER"
                                      ? "warning"
                                      : "secondary"
                                }
                              >
                                {entry.role}
                              </Badge>
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Email Logs</CardTitle>
              <CardDescription>
                Delivery status from <code>/api/v1/email/logs</code>.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="relative rounded-lg border border-border bg-card">
                {isEmailRefreshing ? (
                  <div className="absolute inset-x-0 top-0 z-10 h-0.5 overflow-hidden bg-muted">
                    <div className="h-full w-1/3 animate-pulse bg-primary" />
                  </div>
                ) : null}

                <div className="space-y-3 p-3 md:hidden">
                  {isEmailInitialLoading ? (
                    Array.from({ length: 4 }).map((_, idx) => (
                      <Skeleton key={idx} className="h-32 w-full rounded-lg" />
                    ))
                  ) : emailLogs.length === 0 ? (
                    <p className="py-8 text-center text-sm text-muted-foreground">
                      No email logs found.
                    </p>
                  ) : (
                    emailLogs.map((log) => (
                      <MobileDataCard key={log.id}>
                        <div className="space-y-3">
                          <div className="flex items-start justify-between gap-2">
                            <p className="text-sm font-semibold">{log.receiptNumber}</p>
                            <Badge variant={emailStatusBadgeVariant(log.status)}>
                              {log.status}
                            </Badge>
                          </div>
                          <div className="grid gap-3">
                            <MobileDataCardField
                              label="Recipient"
                              value={log.recipient ?? "No recipient"}
                            />
                            <MobileDataCardField
                              label="Sent At"
                              value={
                                log.sentAt ? new Date(log.sentAt).toLocaleString() : "—"
                              }
                            />
                          </div>
                          <Button
                            size="sm"
                            variant="outline"
                            className="min-h-10 w-full"
                            disabled={resendingId === log.id || isEmailRefreshing}
                            onClick={() => void handleResend(log.id)}
                          >
                            {resendingId === log.id ? "Sending..." : "Resend"}
                          </Button>
                        </div>
                      </MobileDataCard>
                    ))
                  )}
                </div>

                <div className="hidden md:block">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Receipt #</TableHead>
                      <TableHead>Recipient</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Sent At</TableHead>
                      <TableHead className="w-[130px]">Action</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {isEmailInitialLoading ? (
                      Array.from({ length: 8 }).map((_, idx) => (
                        <TableRow key={idx}>
                          <TableCell><Skeleton className="h-4 w-28" /></TableCell>
                          <TableCell><Skeleton className="h-4 w-48" /></TableCell>
                          <TableCell><Skeleton className="h-5 w-20 rounded-full" /></TableCell>
                          <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                          <TableCell><Skeleton className="h-8 w-24" /></TableCell>
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
                          <TableCell>
                            {log.recipient ?? "No recipient"}
                          </TableCell>
                          <TableCell>
                            <Badge variant={emailStatusBadgeVariant(log.status)}>
                              {log.status}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            {log.sentAt ? new Date(log.sentAt).toLocaleString() : "—"}
                          </TableCell>
                          <TableCell>
                            <Button
                              size="sm"
                              variant="outline"
                              disabled={resendingId === log.id || isEmailRefreshing}
                              onClick={() => void handleResend(log.id)}
                            >
                              {resendingId === log.id ? "Sending..." : "Resend"}
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
                </div>
              </div>

              <div className="flex flex-wrap items-center justify-between gap-3">
                <p className="text-sm text-muted-foreground">
                  Page {emailPage} of {emailTotalPages} • Total {emailTotal}
                </p>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={emailPage <= 1 || isEmailRefreshing}
                    onClick={() => setEmailPage((prev) => prev - 1)}
                  >
                    Previous
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={emailPage >= emailTotalPages || isEmailRefreshing}
                    onClick={() => setEmailPage((prev) => prev + 1)}
                  >
                    Next
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </section>
  );
}
