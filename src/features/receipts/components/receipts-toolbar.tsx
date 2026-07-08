"use client";

import { Input, Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui";
import type { ReceiptSource } from "@/types/receipts";

export type ReceiptSortKey = "processed-desc" | "processed-asc" | "source" | "amount-desc" | "amount-asc";

interface ReceiptsToolbarProps {
  search: string;
  source: "all" | ReceiptSource;
  sortBy: ReceiptSortKey;
  onSearchChange: (value: string) => void;
  onSourceChange: (value: "all" | ReceiptSource) => void;
  onSortChange: (value: ReceiptSortKey) => void;
}

export function ReceiptsToolbar({
  search,
  source,
  sortBy,
  onSearchChange,
  onSourceChange,
  onSortChange
}: ReceiptsToolbarProps) {
  return (
    <div className="grid gap-3 md:grid-cols-3">
      <Input
        value={search}
        onChange={(event) => onSearchChange(event.target.value)}
        placeholder="Search vendor, invoice, keywords..."
      />

      <Select value={source} onValueChange={(value: "all" | ReceiptSource) => onSourceChange(value)}>
        <SelectTrigger>
          <SelectValue placeholder="Source" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Sources</SelectItem>
          <SelectItem value="Email">Email</SelectItem>
          <SelectItem value="Manual Upload">Manual Upload</SelectItem>
          <SelectItem value="WhatsApp">WhatsApp</SelectItem>
        </SelectContent>
      </Select>

      <Select value={sortBy} onValueChange={(value: ReceiptSortKey) => onSortChange(value)}>
        <SelectTrigger>
          <SelectValue placeholder="Sort By" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="processed-desc">Newest Processed</SelectItem>
          <SelectItem value="processed-asc">Oldest Processed</SelectItem>
          <SelectItem value="source">Source</SelectItem>
          <SelectItem value="amount-desc">Amount High to Low</SelectItem>
          <SelectItem value="amount-asc">Amount Low to High</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
}
