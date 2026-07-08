"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import { Button, Skeleton } from "@/components/ui";
import { MemberForm } from "@/features/members/components/member-form";
import type { MemberFormValues } from "@/features/members/schemas";
import { membersService } from "@/services/api/membersService";
import type { Member } from "@/types/member";

export default function EditMemberPage() {
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const memberId = params.id;

  const [member, setMember] = useState<Member | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!memberId) return;
    setIsLoading(true);
    membersService
      .getMemberById(memberId)
      .then(setMember)
      .catch(() => {
        toast.error("Failed to load member");
        router.push("/dashboard/members");
      })
      .finally(() => setIsLoading(false));
  }, [memberId, router]);

  async function handleSubmit(values: MemberFormValues) {
    if (!memberId) return;
    try {
      setIsSubmitting(true);
      await membersService.updateMember(memberId, {
        fullName: values.fullName,
        email: values.email || undefined,
        phone: values.phone || undefined,
        membershipNumber: values.membershipNumber || undefined
      });
      toast.success("Member updated successfully!");
      router.push("/dashboard/members");
    } catch {
      toast.error("Failed to update member");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <section className="space-y-6">
      <Button variant="ghost" size="sm" onClick={() => router.back()}>
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back
      </Button>

      {isLoading ? (
        <div className="space-y-3">
          <Skeleton className="h-8 w-60" />
          <Skeleton className="h-[340px] w-full max-w-2xl" />
        </div>
      ) : member ? (
        <MemberForm
          title={`Edit ${member.fullName}`}
          description="Update member details and contact information."
          submitLabel="Save changes"
          isSubmitting={isSubmitting}
          initialValues={{
            fullName: member.fullName,
            email: member.email ?? "",
            phone: member.phone ?? "",
            membershipNumber: member.membershipNumber ?? ""
          }}
          onSubmit={handleSubmit}
        />
      ) : null}
    </section>
  );
}
