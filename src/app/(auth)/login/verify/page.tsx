"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useAuth } from "@/context/AuthContext";
import { authService } from "@/services/api/authService";
import {
  verifyLoginSchema,
  type VerifyLoginSchema
} from "@/features/auth/schemas";
import {
  getResendCooldownRemaining,
  getStoredLoginEmail,
  markCodeResent
} from "@/lib/login-challenge-storage";
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

export default function LoginVerifyPage() {
  const router = useRouter();
  const { verifyLogin } = useAuth();
  const [email, setEmail] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);
  const [cooldownSeconds, setCooldownSeconds] = useState(0);
  const [isResending, setIsResending] = useState(false);

  const form = useForm<VerifyLoginSchema>({
    resolver: zodResolver(verifyLoginSchema),
    defaultValues: { code: "" }
  });

  useEffect(() => {
    const storedEmail = getStoredLoginEmail();
    if (!storedEmail) {
      router.replace("/login");
      return;
    }
    setEmail(storedEmail);
  }, [router]);

  useEffect(() => {
    const updateCooldown = () => {
      setCooldownSeconds(getResendCooldownRemaining());
    };

    updateCooldown();
    const intervalId = window.setInterval(updateCooldown, 1000);
    return () => window.clearInterval(intervalId);
  }, []);

  const onSubmit = async (values: VerifyLoginSchema) => {
    if (!email) return;

    setError(null);
    setInfo(null);

    try {
      const loggedInUser = await verifyLogin({ email, code: values.code });
      router.replace(loggedInUser.mustChangePassword ? "/change-password" : "/dashboard");
    } catch (err) {
      setError(getApiErrorMessage(err, "Verification failed. Please try again."));
    }
  };

  const handleResend = async () => {
    if (!email || cooldownSeconds > 0 || isResending) return;

    setError(null);
    setInfo(null);
    setIsResending(true);

    try {
      const response = await authService.resendCode({ email });
      markCodeResent();
      setCooldownSeconds(getResendCooldownRemaining());
      setInfo(response.message);
      form.reset({ code: "" });
    } catch (err) {
      const message = getApiErrorMessage(
        err,
        "Unable to resend code. Please try again."
      );
      setError(message);

      if (axiosRetryAfter(err)) {
        setCooldownSeconds(axiosRetryAfter(err)!);
      }
    } finally {
      setIsResending(false);
    }
  };

  if (!email) {
    return null;
  }

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-md flex-col justify-center bg-neutral-50 p-6 dark:bg-neutral-950">
      <Card className="w-full border-neutral-200 shadow-xs">
        <CardHeader className="space-y-4 text-center">
          <AuthBranding priority />
          <CardTitle>Verify your login</CardTitle>
          <p className="text-[10px] text-neutral-400">
            Enter the 6-digit code sent to <span className="font-medium">{email}</span>
          </p>
        </CardHeader>
        <CardContent>
          <form
            className="space-y-4"
            onSubmit={form.handleSubmit(onSubmit)}
            noValidate
          >
            <div className="space-y-2">
              <Label htmlFor="code">Verification code</Label>
              <Input
                id="code"
                type="text"
                inputMode="numeric"
                autoComplete="one-time-code"
                placeholder="123456"
                maxLength={6}
                className="text-center text-lg tracking-[0.4em]"
                {...form.register("code")}
              />
              {form.formState.errors.code && (
                <p className="text-sm text-red-600">
                  {form.formState.errors.code.message}
                </p>
              )}
            </div>

            {error && <p className="text-sm text-red-600">{error}</p>}
            {info && <p className="text-sm text-emerald-700">{info}</p>}

            <Button
              type="submit"
              className="min-h-10 w-full"
              disabled={form.formState.isSubmitting}
            >
              {form.formState.isSubmitting ? "Verifying..." : "Verify and continue"}
            </Button>
          </form>

          <div className="mt-4 space-y-3 text-center text-sm">
            <Button
              type="button"
              variant="outline"
              className="w-full"
              disabled={cooldownSeconds > 0 || isResending}
              onClick={() => void handleResend()}
            >
              {isResending
                ? "Sending..."
                : cooldownSeconds > 0
                  ? `Resend code in ${cooldownSeconds}s`
                  : "Resend code"}
            </Button>

            <p className="text-muted-foreground">
              <Link href="/login" className="underline">
                Back to login
              </Link>
            </p>
          </div>
        </CardContent>
      </Card>
      <div className="mt-6">
        <AuthPoweredByFooter />
      </div>
    </main>
  );
}

function axiosRetryAfter(error: unknown): number | null {
  if (
    typeof error === "object" &&
    error !== null &&
    "response" in error &&
    typeof (error as { response?: { data?: { retryAfterSeconds?: number } } })
      .response?.data?.retryAfterSeconds === "number"
  ) {
    return (error as { response: { data: { retryAfterSeconds: number } } })
      .response.data.retryAfterSeconds;
  }

  return null;
}
