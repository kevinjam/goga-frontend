import { z } from "zod";

export const loginSchema = z.object({
  email: z.string().email("Enter a valid email address"),
  password: z.string().min(8, "Password must be at least 8 characters")
});

export const forgotPasswordSchema = z.object({
  email: z.string().email("Enter a valid email address")
});

export const verifyLoginSchema = z.object({
  code: z
    .string()
    .length(6, "Enter the 6-digit verification code")
    .regex(/^\d{6}$/, "Code must contain only numbers")
});

export type LoginSchema = z.infer<typeof loginSchema>;
export type VerifyLoginSchema = z.infer<typeof verifyLoginSchema>;
export type ForgotPasswordSchema = z.infer<typeof forgotPasswordSchema>;
