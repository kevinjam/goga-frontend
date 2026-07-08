"use client";

import { MoreHorizontal, Pencil, Trash2 } from "lucide-react";
import Link from "next/link";
import {
  AlertDialog,
  AlertDialogCancelButton,
  AlertDialogConfirmButton,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTrigger,
  AlertDialogTitle,
  Badge,
  Button,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  Skeleton,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "@/components/ui";
import {
  MobileDataCard,
  MobileDataCardField
} from "@/components/shared/mobile-data-card";
import { TablePaginationFooter } from "@/components/shared/table-pagination-footer";
import type { Member } from "@/types/member";

interface MembersTableProps {
  rows: Member[];
  isLoading: boolean;
  isRefreshing?: boolean;
  page: number;
  limit: number;
  totalPages: number;
  onPageChange: (value: number) => void;
  onLimitChange: (value: number) => void;
  onDelete: (id: string) => Promise<void>;
  deletingId: string | null;
}

export function MembersTable({
  rows,
  isLoading,
  isRefreshing = false,
  page,
  limit,
  totalPages,
  onPageChange,
  onLimitChange,
  onDelete,
  deletingId
}: MembersTableProps) {
  const pageButtons = Array.from({ length: totalPages }, (_, i) => i + 1).slice(
    Math.max(page - 3, 0),
    Math.max(page + 2, 5)
  );

  return (
    <div className="relative rounded-lg border border-border bg-card">
      {isRefreshing ? (
        <div className="absolute inset-x-0 top-0 z-10 h-0.5 overflow-hidden bg-muted">
          <div className="h-full w-1/3 animate-pulse bg-primary" />
        </div>
      ) : null}

      <div className="space-y-3 p-3 md:hidden">
        {isLoading ? (
          Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-36 w-full rounded-lg" />
          ))
        ) : rows.length === 0 ? (
          <p className="py-10 text-center text-sm text-muted-foreground">
            No members found.
          </p>
        ) : (
          rows.map((member) => (
            <MobileDataCard key={member.id}>
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0 flex-1 space-y-3">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="text-sm font-semibold">{member.fullName}</p>
                    <Badge variant={member.isActive ? "success" : "secondary"}>
                      {member.isActive ? "Active" : "Inactive"}
                    </Badge>
                  </div>
                  <div className="grid gap-3 sm:grid-cols-2">
                    <MobileDataCardField label="Email" value={member.email || "—"} />
                    <MobileDataCardField label="Phone" value={member.phone || "—"} />
                    <MobileDataCardField
                      label="Joined"
                      value={new Date(member.createdAt).toLocaleDateString()}
                    />
                  </div>
                </div>
                <RowActions
                  memberId={member.id}
                  memberName={member.fullName}
                  onDelete={onDelete}
                  deleting={deletingId === member.id}
                />
              </div>
            </MobileDataCard>
          ))
        )}
      </div>

      <div className="hidden md:block">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead className="hidden lg:table-cell">Email</TableHead>
              <TableHead>Phone</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="hidden xl:table-cell">Joined</TableHead>
              <TableHead className="w-12" />
            </TableRow>
          </TableHeader>
          <TableBody className={isRefreshing ? "opacity-70 transition-opacity" : undefined}>
            {isLoading ? (
              Array.from({ length: 7 }).map((_, i) => (
                <TableRow key={i}>
                  <TableCell>
                    <Skeleton className="h-4 w-40" />
                  </TableCell>
                  <TableCell className="hidden lg:table-cell">
                    <Skeleton className="h-4 w-52" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-4 w-24" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-5 w-16 rounded-full" />
                  </TableCell>
                  <TableCell className="hidden xl:table-cell">
                    <Skeleton className="h-4 w-24" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="ml-auto h-8 w-8 rounded-md" />
                  </TableCell>
                </TableRow>
              ))
            ) : rows.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="py-10 text-center text-muted-foreground">
                  No members found.
                </TableCell>
              </TableRow>
            ) : (
              rows.map((member) => (
                <TableRow key={member.id}>
                  <TableCell className="font-medium">{member.fullName}</TableCell>
                  <TableCell className="hidden lg:table-cell">{member.email || "—"}</TableCell>
                  <TableCell>{member.phone || "—"}</TableCell>
                  <TableCell>
                    <Badge variant={member.isActive ? "success" : "secondary"}>
                      {member.isActive ? "Active" : "Inactive"}
                    </Badge>
                  </TableCell>
                  <TableCell className="hidden xl:table-cell">
                    {new Date(member.createdAt).toLocaleDateString()}
                  </TableCell>
                  <TableCell>
                    <RowActions
                      memberId={member.id}
                      memberName={member.fullName}
                      onDelete={onDelete}
                      deleting={deletingId === member.id}
                    />
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <TablePaginationFooter
        page={page}
        limit={limit}
        totalPages={totalPages}
        isRefreshing={isRefreshing}
        pageButtons={pageButtons}
        onPageChange={onPageChange}
        onLimitChange={onLimitChange}
      />
    </div>
  );
}

function RowActions({
  memberId,
  memberName,
  onDelete,
  deleting
}: {
  memberId: string;
  memberName: string;
  onDelete: (id: string) => Promise<void>;
  deleting: boolean;
}) {
  return (
    <AlertDialog>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon" className="h-10 w-10" aria-label="Open actions">
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuLabel>Actions</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem asChild>
            <Link href={`/dashboard/members/${memberId}/edit`}>
              <Pencil className="mr-2 h-4 w-4" />
              Edit
            </Link>
          </DropdownMenuItem>
          <AlertDialogTrigger asChild>
            <DropdownMenuItem
              onSelect={(e) => e.preventDefault()}
              className="text-danger focus:text-danger"
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Delete
            </DropdownMenuItem>
          </AlertDialogTrigger>
        </DropdownMenuContent>
      </DropdownMenu>

      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete member?</AlertDialogTitle>
          <AlertDialogDescription>
            This will permanently delete <strong>{memberName}</strong>. This action
            cannot be undone.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancelButton>Cancel</AlertDialogCancelButton>
          <AlertDialogConfirmButton
            className="bg-danger text-white hover:opacity-90"
            disabled={deleting}
            onClick={() => onDelete(memberId)}
          >
            {deleting ? "Deleting..." : "Delete member"}
          </AlertDialogConfirmButton>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
