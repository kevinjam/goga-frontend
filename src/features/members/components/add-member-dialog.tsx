"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import {
  Button,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  Input,
  Label
} from "@/components/ui";
import {
  memberFormSchema,
  type MemberFormValues
} from "@/features/members/schemas";
import { membersService } from "@/services/api/membersService";
import { getApiErrorMessage } from "@/lib/utils";

interface AddMemberDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreated?: () => void;
}

export function AddMemberDialog({
  open,
  onOpenChange,
  onCreated
}: AddMemberDialogProps) {
  const form = useForm<MemberFormValues>({
    resolver: zodResolver(memberFormSchema),
    defaultValues: {
      fullName: "",
      email: "",
      phone: "",
      membershipNumber: ""
    }
  });

  useEffect(() => {
    if (!open) {
      form.reset();
    }
  }, [open, form]);

  async function onSubmit(values: MemberFormValues) {
    try {
      await membersService.createMember({
        fullName: values.fullName,
        email: values.email || undefined,
        phone: values.phone || undefined
      });
      toast.success("Member created successfully!");
      onOpenChange(false);
      onCreated?.();
    } catch (error) {
      toast.error(getApiErrorMessage(error, "Failed to create member"));
    }
  }

  const isSubmitting = form.formState.isSubmitting;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add new member</DialogTitle>
          <DialogDescription>
            Capture member details here. Membership number is auto-generated.
          </DialogDescription>
        </DialogHeader>

        <form
          id="add-member-form"
          className="space-y-4"
          onSubmit={form.handleSubmit(onSubmit)}
          noValidate
        >
          <div className="space-y-2">
            <Label htmlFor="add-member-fullName">Full name</Label>
            <Input id="add-member-fullName" {...form.register("fullName")} />
            {form.formState.errors.fullName ? (
              <p className="text-sm text-danger">
                {form.formState.errors.fullName.message}
              </p>
            ) : null}
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="add-member-email">Email</Label>
              <Input
                id="add-member-email"
                type="email"
                {...form.register("email")}
              />
              {form.formState.errors.email ? (
                <p className="text-sm text-danger">
                  {form.formState.errors.email.message}
                </p>
              ) : null}
            </div>

            <div className="space-y-2">
              <Label htmlFor="add-member-phone">Phone</Label>
              <Input id="add-member-phone" {...form.register("phone")} />
              {form.formState.errors.phone ? (
                <p className="text-sm text-danger">
                  {form.formState.errors.phone.message}
                </p>
              ) : null}
            </div>
          </div>
        </form>

        <DialogFooter className="sm:justify-end">
          <Button
            type="button"
            variant="outline"
            className="min-h-10 w-full sm:w-auto"
            disabled={isSubmitting}
            onClick={() => onOpenChange(false)}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            form="add-member-form"
            className="min-h-10 w-full sm:w-auto"
            disabled={isSubmitting}
          >
            {isSubmitting ? "Creating..." : "Create member"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
