"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { settingsService } from "@/services/api/settingsService";
import type { SecuritySettings } from "@/types/settings";
import {
  Alert,
  AlertDescription,
  AlertTitle,
  Badge,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Button,
  Input,
  Label,
  Skeleton
} from "@/components/ui";

const adminResetSchema = z.object({
  email: z.string().email("Enter a valid user email")
});

type AdminResetSchema = z.infer<typeof adminResetSchema>;

export function SecuritySettingsTab() {
  const [settings, setSettings] = useState<SecuritySettings | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const form = useForm<AdminResetSchema>({
    resolver: zodResolver(adminResetSchema),
    defaultValues: { email: "" }
  });

  useEffect(() => {
    const controller = new AbortController();
    settingsService
      .getSecuritySettings(controller.signal)
      .then((data) => {
        if (controller.signal.aborted) return;
        setSettings(data);
      })
      .finally(() => {
        if (controller.signal.aborted) return;
        setIsLoading(false);
      });
    return () => controller.abort();
  }, []);

  if (isLoading) {
    return <Skeleton className="h-full w-full rounded-lg" />;
  }

  return (
    <div className="grid h-full min-h-0 gap-4 md:grid-cols-2">
      <Card className="shadow-sm">
        <CardHeader className="border-b border-neutral-200 bg-neutral-50 pb-3 dark:border-neutral-800 dark:bg-neutral-900/50">
          <CardTitle className="font-display text-sm font-bold uppercase tracking-wider">
            Invitation Expiry
          </CardTitle>
          <CardDescription>Time-limited temporary passwords for new users.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between rounded-lg border border-border p-4">
            <div>
              <p className="font-medium">Expiry window</p>
              <p className="text-sm text-muted-foreground">
                Temporary passwords expire after this period.
              </p>
            </div>
            <Badge variant={settings?.invitationExpiryEnabled ? "success" : "secondary"}>
              {settings?.invitationExpiryEnabled
                ? `${settings.invitationExpiryHours}h`
                : "Disabled"}
            </Badge>
          </div>
          <Alert>
            <AlertTitle>Configuration</AlertTitle>
            <AlertDescription>
              Set <code>INVITATION_EXPIRY_HOURS</code> in the backend environment (0 to disable).
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>

      <Card className="shadow-sm">
        <CardHeader className="border-b border-neutral-200 bg-neutral-50 pb-3 dark:border-neutral-800 dark:bg-neutral-900/50">
          <CardTitle className="font-display text-sm font-bold uppercase tracking-wider">
            Admin Password Reset
          </CardTitle>
          <CardDescription>
            Trigger password reset links for users from Settings (not public).
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between rounded-lg border border-border p-4">
            <div>
              <p className="font-medium">Forgot password flow</p>
              <p className="text-sm text-muted-foreground">
                Sends a 1-hour reset link to the user&apos;s email from this admin panel.
              </p>
            </div>
            <Badge variant={settings?.forgotPasswordEnabled ? "success" : "secondary"}>
              {settings?.forgotPasswordEnabled ? "Enabled" : "Disabled"}
            </Badge>
          </div>

          <form
            className="space-y-3 rounded-lg border border-border p-4"
            onSubmit={form.handleSubmit(async (values) => {
              try {
                const response = await settingsService.requestUserPasswordReset(
                  values.email.trim().toLowerCase()
                );
                toast.success(response.message);
                form.reset();
              } catch (error) {
                toast.error(
                  error instanceof Error
                    ? error.message
                    : "Failed to send password reset email."
                );
              }
            })}
            noValidate
          >
            <div className="space-y-1.5">
              <Label htmlFor="admin-reset-email">User email</Label>
              <Input
                id="admin-reset-email"
                type="email"
                placeholder="user@example.com"
                {...form.register("email")}
              />
              {form.formState.errors.email ? (
                <p className="text-xs text-red-600">
                  {form.formState.errors.email.message}
                </p>
              ) : null}
            </div>

            <Button
              type="submit"
              disabled={form.formState.isSubmitting}
              className="w-full sm:w-auto"
            >
              {form.formState.isSubmitting ? "Sending..." : "Send reset link"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
