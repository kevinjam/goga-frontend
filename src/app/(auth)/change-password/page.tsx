"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useAuth } from "@/context/AuthContext";
import {
  changePasswordSchema,
  type ChangePasswordSchema
} from "@/features/auth/schemas";
import {
  AuthBranding,
  AuthPoweredByFooter
} from "@/components/branding/auth-branding";
import { getApiErrorMessage } from "@/lib/utils";
import {
  Alert,
  AlertDescription,
  AlertTitle,
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Input,
  Label
} from "@/components/ui";

export default function ChangePasswordPage() {
  const router = useRouter();
  const { changePassword, isLoading, mustChangePassword } = useAuth();
  const [error, setError] = useState<string | null>(null);

  const form = useForm<ChangePasswordSchema>({
    resolver: zodResolver(changePasswordSchema),
    defaultValues: {
      currentPassword: "",
      newPassword: "",
      confirmPassword: ""
    }
  });

  useEffect(() => {
    if (!isLoading && !mustChangePassword) {
      router.replace("/dashboard");
    }
  }, [isLoading, mustChangePassword, router]);

  const onSubmit = async (values: ChangePasswordSchema) => {
    setError(null);

    try {
      await changePassword(values);
      router.replace("/dashboard");
    } catch (err) {
      setError(getApiErrorMessage(err, "Failed to change password. Please try again."));
    }
  };

  if (isLoading) {
    return null;
  }

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-md flex-col justify-center bg-neutral-50 p-6 dark:bg-neutral-950">
      <Card className="w-full border-neutral-200 shadow-xs">
        <CardHeader className="space-y-6">
          <AuthBranding />
          <CardTitle className="text-center">Change your password</CardTitle>
          <p className="text-center text-[10px] text-neutral-400">
            For security, you must set a new password before accessing the system.
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          <Alert>
            <AlertTitle>Password requirements</AlertTitle>
            <AlertDescription>
              Minimum 12 characters with uppercase, lowercase, number, and special character.
            </AlertDescription>
          </Alert>

          <form className="space-y-4" onSubmit={form.handleSubmit(onSubmit)} noValidate>
            <div className="space-y-2">
              <Label htmlFor="currentPassword">Current Password</Label>
              <Input
                id="currentPassword"
                type="password"
                autoComplete="current-password"
                {...form.register("currentPassword")}
              />
              {form.formState.errors.currentPassword ? (
                <p className="text-sm text-red-600">
                  {form.formState.errors.currentPassword.message}
                </p>
              ) : null}
            </div>

            <div className="space-y-2">
              <Label htmlFor="newPassword">New Password</Label>
              <Input
                id="newPassword"
                type="password"
                autoComplete="new-password"
                {...form.register("newPassword")}
              />
              {form.formState.errors.newPassword ? (
                <p className="text-sm text-red-600">
                  {form.formState.errors.newPassword.message}
                </p>
              ) : null}
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirm Password</Label>
              <Input
                id="confirmPassword"
                type="password"
                autoComplete="new-password"
                {...form.register("confirmPassword")}
              />
              {form.formState.errors.confirmPassword ? (
                <p className="text-sm text-red-600">
                  {form.formState.errors.confirmPassword.message}
                </p>
              ) : null}
            </div>

            {error ? <p className="text-sm text-red-600">{error}</p> : null}

            <Button
              type="submit"
              className="min-h-10 w-full"
              disabled={form.formState.isSubmitting}
            >
              {form.formState.isSubmitting ? "Updating..." : "Update password"}
            </Button>
          </form>
        </CardContent>
      </Card>
      <AuthPoweredByFooter />
    </main>
  );
}
