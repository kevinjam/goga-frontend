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

export const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, "Current password is required"),
    newPassword: z
      .string()
      .min(12, "Password must be at least 12 characters")
      .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
      .regex(/[a-z]/, "Password must contain at least one lowercase letter")
      .regex(/[0-9]/, "Password must contain at least one number")
      .regex(/[^A-Za-z0-9]/, "Password must contain at least one special character"),
    confirmPassword: z.string().min(1, "Please confirm your new password")
  })
  .refine((values) => values.newPassword === values.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"]
  });

export type LoginSchema = z.infer<typeof loginSchema>;
export type VerifyLoginSchema = z.infer<typeof verifyLoginSchema>;
export type ForgotPasswordSchema = z.infer<typeof forgotPasswordSchema>;
export type ChangePasswordSchema = z.infer<typeof changePasswordSchema>;
