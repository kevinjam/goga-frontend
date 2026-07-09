"use client";

import { useEffect, useMemo, useState } from "react";
import { Plus, Search } from "lucide-react";
import { toast } from "sonner";
import { Button, Card, CardContent, CardHeader, CardTitle, Input } from "@/components/ui";
import { membersService } from "@/services/api/membersService";
import { useDebounce } from "@/hooks/useDebounce";
import { useMembersList } from "@/hooks/useMembersList";
import { AddMemberDialog } from "@/features/members/components/add-member-dialog";
import { MembersTable } from "@/features/members/components/members-table";

export default function MembersPage() {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const debouncedSearch = useDebounce(search, 300);

  const query = useMemo(
    () => ({ page, limit, search: debouncedSearch || undefined }),
    [page, limit, debouncedSearch]
  );

  const { members, totalPages, isInitialLoading, isRefreshing, error, refetch } =
    useMembersList(query);

  useEffect(() => {
    if (error) {
      toast.error("Failed to fetch members");
    }
  }, [error]);

  async function handleDelete(id: string) {
    try {
      setDeletingId(id);
      await membersService.deleteMember(id);
      toast.success("Member deleted successfully");
      await refetch();
    } catch {
      toast.error("Failed to delete member");
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <section className="space-y-6">
      <div className="flex flex-wrap items-center justify-end gap-3">
        <Button className="w-full sm:w-auto" onClick={() => setIsAddDialogOpen(true)}>
          <Plus className="h-3.5 w-3.5" />
          Add member
        </Button>
      </div>

      <AddMemberDialog
        open={isAddDialogOpen}
        onOpenChange={setIsAddDialogOpen}
        onCreated={() => void refetch()}
      />

      <Card className="overflow-hidden">
        <CardHeader className="border-b border-neutral-200 bg-neutral-50 pb-3 dark:border-neutral-800 dark:bg-neutral-900/50">
          <CardTitle className="font-display text-sm font-bold tracking-tight uppercase">
            Members Directory
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="relative w-full max-w-md">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={search}
              onChange={(e) => {
                setPage(1);
                setSearch(e.target.value);
              }}
              placeholder="Search by name or email..."
              className="pl-9"
            />
          </div>

          <MembersTable
            rows={members}
            isLoading={isInitialLoading}
            isRefreshing={isRefreshing}
            page={page}
            limit={limit}
            totalPages={totalPages}
            onPageChange={setPage}
            onLimitChange={(nextLimit) => {
              setPage(1);
              setLimit(nextLimit);
            }}
            deletingId={deletingId}
            onDelete={handleDelete}
          />
        </CardContent>
      </Card>
    </section>
  );
}
