"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Input,
  Label
} from "@/components/ui";
import {
  memberFormSchema,
  type MemberFormValues
} from "@/features/members/schemas";

export interface MemberFormProps {
  title: string;
  description?: string;
  initialValues?: Partial<MemberFormValues>;
  onSubmit: (values: MemberFormValues) => Promise<void>;
  isSubmitting?: boolean;
  submitLabel?: string;
  showMembershipNumberField?: boolean;
}

export function MemberForm({
  title,
  description,
  initialValues,
  onSubmit,
  isSubmitting = false,
  submitLabel = "Save member",
  showMembershipNumberField = true
}: MemberFormProps) {
  const form = useForm<MemberFormValues>({
    resolver: zodResolver(memberFormSchema),
    defaultValues: {
      fullName: initialValues?.fullName ?? "",
      email: initialValues?.email ?? "",
      phone: initialValues?.phone ?? "",
      membershipNumber: initialValues?.membershipNumber ?? ""
    }
  });

  return (
    <Card className="w-full max-w-2xl">
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        {description && <CardDescription>{description}</CardDescription>}
      </CardHeader>
      <CardContent>
        <form
          className="space-y-4"
          onSubmit={form.handleSubmit(onSubmit)}
          noValidate
        >
          <div className="space-y-2">
            <Label htmlFor="fullName">Full name</Label>
            <Input id="fullName" {...form.register("fullName")} />
            {form.formState.errors.fullName && (
              <p className="text-sm text-danger">
                {form.formState.errors.fullName.message}
              </p>
            )}
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" {...form.register("email")} />
              {form.formState.errors.email && (
                <p className="text-sm text-danger">
                  {form.formState.errors.email.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">Phone</Label>
              <Input id="phone" {...form.register("phone")} />
              {form.formState.errors.phone && (
                <p className="text-sm text-danger">
                  {form.formState.errors.phone.message}
                </p>
              )}
            </div>
          </div>

          {showMembershipNumberField ? (
            <div className="space-y-2">
              <Label htmlFor="membershipNumber">Membership number</Label>
              <Input id="membershipNumber" {...form.register("membershipNumber")} />
              {form.formState.errors.membershipNumber && (
                <p className="text-sm text-danger">
                  {form.formState.errors.membershipNumber.message}
                </p>
              )}
            </div>
          ) : null}

          <Button
            type="submit"
            disabled={isSubmitting || form.formState.isSubmitting}
          >
            {isSubmitting || form.formState.isSubmitting
              ? "Saving..."
              : submitLabel}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
