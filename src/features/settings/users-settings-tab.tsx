"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { authService } from "@/services/api/authService";
import { settingsService } from "@/services/api/settingsService";
import type { UserRole } from "@/types/auth";
import type { SettingsUser } from "@/types/settings";
import {
  Alert,
  AlertDescription,
  AlertTitle,
  Badge,
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Input,
  Label,
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

const createAdminSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Enter a valid email address"),
  role: z.enum(["ADMIN", "FINANCE_OFFICER", "VIEWER"])
});

type CreateAdminSchema = z.infer<typeof createAdminSchema>;

function welcomeStatusVariant(status: SettingsUser["lastWelcomeEmailStatus"]) {
  if (status === "SENT" || status === "RESENT") return "success" as const;
  if (status === "FAILED") return "danger" as const;
  return "secondary" as const;
}

export function UsersSettingsTab({
  users,
  isLoading,
  onRefresh
}: {
  users: SettingsUser[];
  isLoading: boolean;
  onRefresh: () => Promise<void>;
}) {
  const [resendingWelcomeId, setResendingWelcomeId] = useState<string | null>(null);
  const [updatingStatusId, setUpdatingStatusId] = useState<string | null>(null);
  const [lastCreatedAdmin, setLastCreatedAdmin] = useState<string | null>(null);

  const form = useForm<CreateAdminSchema>({
    resolver: zodResolver(createAdminSchema),
    defaultValues: { name: "", email: "", role: "ADMIN" }
  });

  async function onSubmit(values: CreateAdminSchema) {
    try {
      const created = await authService.registerUser({
        name: values.name.trim(),
        email: values.email.trim().toLowerCase(),
        role: values.role
      });
      setLastCreatedAdmin(created.user.email);
      form.reset();
      await onRefresh();
      toast[created.emailSent ? "success" : "warning"](created.message);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to create user.");
    }
  }

  async function handleResendWelcome(userId: string) {
    try {
      setResendingWelcomeId(userId);
      const response = await settingsService.resendWelcomeEmail(userId);
      toast.success(response.message);
      await onRefresh();
    } catch {
      toast.error("Failed to resend welcome email.");
    } finally {
      setResendingWelcomeId(null);
    }
  }

  async function handleToggleStatus(user: SettingsUser) {
    try {
      setUpdatingStatusId(user.id);
      await settingsService.updateUserStatus(user.id, !user.isActive);
      toast.success(user.isActive ? "User deactivated." : "User activated.");
      await onRefresh();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to update user status.");
    } finally {
      setUpdatingStatusId(null);
    }
  }

  return (
    <div className="grid h-full min-h-0 gap-4 lg:grid-cols-[340px_1fr]">
      <Card className="flex flex-col overflow-hidden">
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Create Admin User</CardTitle>
          <CardDescription>Auto-generated temporary password with welcome email.</CardDescription>
        </CardHeader>
        <CardContent className="overflow-y-auto">
          <form className="space-y-3" onSubmit={form.handleSubmit(onSubmit)} noValidate>
            <div className="space-y-1.5">
              <Label htmlFor="name">Full Name</Label>
              <Input id="name" placeholder="Jane Admin" {...form.register("name")} />
              {form.formState.errors.name ? (
                <p className="text-xs text-red-600">{form.formState.errors.name.message}</p>
              ) : null}
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" placeholder="admin@goga.local" {...form.register("email")} />
              {form.formState.errors.email ? (
                <p className="text-xs text-red-600">{form.formState.errors.email.message}</p>
              ) : null}
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="role">Role</Label>
              <Select
                value={form.watch("role")}
                onValueChange={(value: UserRole) => form.setValue("role", value, { shouldValidate: true })}
              >
                <SelectTrigger id="role"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="ADMIN">Admin</SelectItem>
                  <SelectItem value="FINANCE_OFFICER">Finance Officer</SelectItem>
                  <SelectItem value="VIEWER">Viewer</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button type="submit" className="w-full" disabled={form.formState.isSubmitting}>
              {form.formState.isSubmitting ? "Creating..." : "Create User"}
            </Button>
            {lastCreatedAdmin ? (
              <p className="text-xs text-muted-foreground">Last created: {lastCreatedAdmin}</p>
            ) : null}
          </form>
        </CardContent>
      </Card>

      <Card className="flex min-h-0 flex-col overflow-hidden">
        <CardHeader className="pb-3">
          <CardTitle className="text-base">System Users</CardTitle>
          <CardDescription>Manage accounts, welcome email status, and activation.</CardDescription>
        </CardHeader>
        <CardContent className="min-h-0 flex-1 overflow-auto p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Welcome Email</TableHead>
                <TableHead className="w-[220px]">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                Array.from({ length: 5 }).map((_, idx) => (
                  <TableRow key={idx}>
                    {Array.from({ length: 6 }).map((__, cellIdx) => (
                      <TableCell key={cellIdx}><Skeleton className="h-4 w-20" /></TableCell>
                    ))}
                  </TableRow>
                ))
              ) : users.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="py-8 text-center text-muted-foreground">
                    No users available.
                  </TableCell>
                </TableRow>
              ) : (
                users.map((entry) => (
                  <TableRow key={entry.id}>
                    <TableCell className="font-medium">{entry.name}</TableCell>
                    <TableCell>{entry.email}</TableCell>
                    <TableCell>
                      <Badge variant={entry.role === "ADMIN" ? "success" : entry.role === "FINANCE_OFFICER" ? "warning" : "secondary"}>
                        {entry.role}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant={entry.isActive ? "success" : "danger"}>
                        {entry.isActive ? "Active" : "Inactive"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        <Badge variant={welcomeStatusVariant(entry.lastWelcomeEmailStatus)}>
                          {entry.lastWelcomeEmailStatus ?? "NONE"}
                        </Badge>
                        {entry.lastWelcomeEmailAt ? (
                          <p className="text-xs text-muted-foreground">
                            {new Date(entry.lastWelcomeEmailAt).toLocaleString()}
                          </p>
                        ) : null}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          disabled={resendingWelcomeId === entry.id}
                          onClick={() => void handleResendWelcome(entry.id)}
                        >
                          {resendingWelcomeId === entry.id ? "Sending..." : "Resend"}
                        </Button>
                        <Button
                          size="sm"
                          variant={entry.isActive ? "outline" : "default"}
                          disabled={updatingStatusId === entry.id}
                          onClick={() => void handleToggleStatus(entry)}
                        >
                          {updatingStatusId === entry.id
                            ? "Saving..."
                            : entry.isActive
                              ? "Deactivate"
                              : "Activate"}
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
