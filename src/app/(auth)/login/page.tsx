"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { getApiErrorMessage } from "@/lib/utils";
import { useAuth } from "@/context/AuthContext";
import { loginSchema, type LoginSchema } from "@/features/auth/schemas";
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

export default function LoginPage() {
  const router = useRouter();
  const { startLogin } = useAuth();
  const [error, setError] = useState<string | null>(null);

  const form = useForm<LoginSchema>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: ""
    }
  });

  const onSubmit = async (values: LoginSchema) => {
    setError(null);
    try {
      await startLogin(values);
      router.replace("/login/verify");
    } catch (err) {
      setError(getApiErrorMessage(err, "Login failed. Please check your credentials."));
    }
  };

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-md flex-col justify-center bg-neutral-50 p-6 dark:bg-neutral-950">
      <Card className="w-full border-neutral-200 shadow-xs">
        <CardHeader className="space-y-6">
          <AuthBranding priority />
          <CardTitle className="text-center text-base">Sign in</CardTitle>
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
                autoComplete="email"
                {...form.register("email")}
              />
              {form.formState.errors.email && (
                <p className="text-xs text-red-600">
                  {form.formState.errors.email.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                autoComplete="current-password"
                placeholder="********"
                {...form.register("password")}
              />
              {form.formState.errors.password && (
                <p className="text-xs text-red-600">
                  {form.formState.errors.password.message}
                </p>
              )}
            </div>

            {error && <p className="text-sm text-red-600">{error}</p>}

            <Button
              type="submit"
              className="min-h-10 w-full"
              disabled={form.formState.isSubmitting}
            >
              {form.formState.isSubmitting ? "Signing in..." : "Sign in"}
            </Button>
          </form>

        </CardContent>
      </Card>
      <div className="mt-6">
        <AuthPoweredByFooter />
      </div>
    </main>
  );
}
