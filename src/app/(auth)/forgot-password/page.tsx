"use client";

import { useState } from "react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { authService } from "@/services/api/authService";
import {
  forgotPasswordSchema,
  type ForgotPasswordSchema
} from "@/features/auth/schemas";
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

export default function ForgotPasswordPage() {
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const form = useForm<ForgotPasswordSchema>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: { email: "" }
  });

  const onSubmit = async (values: ForgotPasswordSchema) => {
    setSubmitting(true);
    setMessage(null);
    setError(null);
    try {
      await authService.requestPasswordReset(values.email);
      setMessage(
        "If your email exists in our system, a reset link or OTP has been sent."
      );
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Unable to process your request."
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-md flex-col justify-center p-6">
      <Card className="w-full">
        <CardHeader className="space-y-6">
          <AuthBranding />
          <CardTitle className="text-center text-base">Forgot Password</CardTitle>
        </CardHeader>
        <CardContent>
          <form
            className="space-y-4"
            onSubmit={form.handleSubmit(onSubmit)}
            noValidate
          >
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="you@example.com"
                {...form.register("email")}
              />
              {form.formState.errors.email && (
                <p className="text-sm text-red-600">
                  {form.formState.errors.email.message}
                </p>
              )}
            </div>

            {message && <p className="text-sm text-green-600">{message}</p>}
            {error && <p className="text-sm text-red-600">{error}</p>}

            <Button type="submit" disabled={submitting} className="min-h-10 w-full">
              {submitting ? "Submitting..." : "Request reset"}
            </Button>
          </form>

          <p className="mt-4 text-center text-sm text-muted-foreground">
            Remembered your password?{" "}
            <Link href="/login" className="underline">
              Back to login
            </Link>
          </p>
        </CardContent>
      </Card>
      <div className="mt-6">
        <AuthPoweredByFooter />
      </div>
    </main>
  );
}
