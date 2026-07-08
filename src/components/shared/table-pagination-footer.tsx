import { Button, Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui";

interface TablePaginationFooterProps {
  page: number;
  limit: number;
  totalPages: number;
  total?: number;
  isRefreshing?: boolean;
  pageButtons?: number[];
  onPageChange: (page: number) => void;
  onLimitChange: (limit: number) => void;
}

export function TablePaginationFooter({
  page,
  limit,
  totalPages,
  total,
  isRefreshing = false,
  pageButtons,
  onPageChange,
  onLimitChange
}: TablePaginationFooterProps) {
  const buttons =
    pageButtons ??
    Array.from({ length: totalPages }, (_, i) => i + 1).slice(
      Math.max(page - 3, 0),
      Math.max(page + 2, 5)
    );

  return (
    <div className="flex flex-col gap-3 border-t border-border p-3 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between">
      <div className="flex items-center gap-2">
        <span className="text-sm text-muted-foreground">Rows:</span>
        <Select value={String(limit)} onValueChange={(value) => onLimitChange(Number(value))}>
          <SelectTrigger className="h-9 w-20">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {[10, 20, 50].map((size) => (
              <SelectItem key={size} value={String(size)}>
                {size}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {typeof total === "number" ? (
        <p className="text-sm text-muted-foreground">
          Page {page} of {totalPages} • Total {total}
        </p>
      ) : null}

      <div className="flex flex-wrap items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          className="min-h-9"
          disabled={page <= 1 || isRefreshing}
          onClick={() => onPageChange(page - 1)}
        >
          Previous
        </Button>
        {buttons.length > 0 ? (
          <div className="hidden items-center gap-1 sm:flex">
            {buttons.map((pageNum) => (
              <Button
                key={pageNum}
                size="sm"
                className="min-h-9 min-w-9"
                variant={page === pageNum ? "default" : "outline"}
                disabled={isRefreshing}
                onClick={() => onPageChange(pageNum)}
              >
                {pageNum}
              </Button>
            ))}
          </div>
        ) : null}
        <span className="text-sm text-muted-foreground sm:hidden">
          {page} / {totalPages}
        </span>
        <Button
          variant="outline"
          size="sm"
          className="min-h-9"
          disabled={page >= totalPages || isRefreshing}
          onClick={() => onPageChange(page + 1)}
        >
          Next
        </Button>
      </div>
    </div>
  );
}
