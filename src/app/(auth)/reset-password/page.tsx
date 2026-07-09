"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { authService } from "@/services/api/authService";
import { getApiErrorMessage } from "@/lib/utils";
import {
  AuthBranding,
  AuthPoweredByFooter
} from "@/components/branding/auth-branding";
import {
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Input,
  Label
} from "@/components/ui";

const resetPasswordSchema = z
  .object({
    newPassword: z
      .string()
      .min(12, "Password must be at least 12 characters")
      .regex(/[A-Z]/, "Must include uppercase")
      .regex(/[a-z]/, "Must include lowercase")
      .regex(/[0-9]/, "Must include number")
      .regex(/[^A-Za-z0-9]/, "Must include special character"),
    confirmPassword: z.string().min(1, "Confirm your password")
  })
  .refine((values) => values.newPassword === values.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"]
  });

type ResetPasswordSchema = z.infer<typeof resetPasswordSchema>;

export default function ResetPasswordPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token") ?? "";
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const form = useForm<ResetPasswordSchema>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: { newPassword: "", confirmPassword: "" }
  });

  const onSubmit = async (values: ResetPasswordSchema) => {
    if (!token) {
      setError("Reset token is missing. Please use the link from your email.");
      return;
    }

    setError(null);
    setMessage(null);

    try {
      const response = await authService.resetPassword({
        token,
        newPassword: values.newPassword,
        confirmPassword: values.confirmPassword
      });
      setMessage(response.message);
      setTimeout(() => router.replace("/login"), 1500);
    } catch (err) {
      setError(getApiErrorMessage(err, "Unable to reset password."));
    }
  };

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-md flex-col justify-center p-6">
      <Card className="w-full">
        <CardHeader className="space-y-6">
          <AuthBranding />
          <CardTitle className="text-center text-base">Reset Password</CardTitle>
        </CardHeader>
        <CardContent>
          <form className="space-y-4" onSubmit={form.handleSubmit(onSubmit)} noValidate>
            <div className="space-y-2">
              <Label htmlFor="newPassword">New Password</Label>
              <Input id="newPassword" type="password" {...form.register("newPassword")} />
              {form.formState.errors.newPassword ? (
                <p className="text-sm text-red-600">{form.formState.errors.newPassword.message}</p>
              ) : null}
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirm Password</Label>
              <Input id="confirmPassword" type="password" {...form.register("confirmPassword")} />
              {form.formState.errors.confirmPassword ? (
                <p className="text-sm text-red-600">{form.formState.errors.confirmPassword.message}</p>
              ) : null}
            </div>
            {message ? <p className="text-sm text-green-600">{message}</p> : null}
            {error ? <p className="text-sm text-red-600">{error}</p> : null}
            <Button type="submit" className="min-h-10 w-full" disabled={form.formState.isSubmitting}>
              {form.formState.isSubmitting ? "Resetting..." : "Reset password"}
            </Button>
          </form>
          <p className="mt-4 text-center text-sm text-muted-foreground">
            <Link href="/login" className="underline">Back to login</Link>
          </p>
        </CardContent>
      </Card>
      <div className="mt-6"><AuthPoweredByFooter /></div>
    </main>
  );
}
