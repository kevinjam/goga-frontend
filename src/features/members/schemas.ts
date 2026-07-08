import { z } from "zod";

export const memberFormSchema = z.object({
  fullName: z.string().min(2, "Full name is required"),
  email: z
    .string()
    .email("Enter a valid email")
    .or(z.literal(""))
    .optional(),
  phone: z.string().max(20).optional(),
  membershipNumber: z.string().max(50).optional()
});

export type MemberFormValues = z.infer<typeof memberFormSchema>;
