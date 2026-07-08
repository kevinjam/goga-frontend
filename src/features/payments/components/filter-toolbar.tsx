"use client";

import { Input, Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui";
import type { PaymentStatus } from "@/types/payments";

export type DateRangeFilter = "all" | "7d" | "30d" | "90d";
export type MethodFilter = "all" | "BANK" | "MTN_MOMO" | "AIRTEL_MONEY" | "CASH";

interface FilterToolbarProps {
  search: string;
  status: "all" | PaymentStatus;
  method: MethodFilter;
  dateRange: DateRangeFilter;
  onSearchChange: (value: string) => void;
  onStatusChange: (value: "all" | PaymentStatus) => void;
  onMethodChange: (value: MethodFilter) => void;
  onDateRangeChange: (value: DateRangeFilter) => void;
}

const statusOptions: Array<{ label: string; value: "all" | PaymentStatus }> = [
  { label: "All Statuses", value: "all" },
  { label: "Matched", value: "MATCHED" },
  { label: "Pending", value: "PENDING" },
  { label: "Error", value: "FAILED" },
  { label: "Discrepancy", value: "NEEDS_REVIEW" },
  { label: "Receipted", value: "RECEIPTED" }
];

const methodOptions: Array<{ label: string; value: MethodFilter }> = [
  { label: "All Methods", value: "all" },
  { label: "Bank", value: "BANK" },
  { label: "MTN MoMo", value: "MTN_MOMO" },
  { label: "Airtel Money", value: "AIRTEL_MONEY" },
  { label: "Cash", value: "CASH" }
];

const dateRangeOptions: Array<{ label: string; value: DateRangeFilter }> = [
  { label: "All Dates", value: "all" },
  { label: "Last 7 days", value: "7d" },
  { label: "Last 30 days", value: "30d" },
  { label: "Last 90 days", value: "90d" }
];

export function FilterToolbar({
  search,
  status,
  method,
  dateRange,
  onSearchChange,
  onStatusChange,
  onMethodChange,
  onDateRangeChange
}: FilterToolbarProps) {
  return (
    <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
      <Input
        value={search}
        onChange={(event) => onSearchChange(event.target.value)}
        placeholder="Search vendor, reference, amount..."
        className="min-h-10"
      />

      <Select value={status} onValueChange={(value: "all" | PaymentStatus) => onStatusChange(value)}>
        <SelectTrigger className="min-h-10">
          <SelectValue placeholder="Status" />
        </SelectTrigger>
        <SelectContent>
          {statusOptions.map((item) => (
            <SelectItem key={item.value} value={item.value}>
              {item.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select value={method} onValueChange={(value: MethodFilter) => onMethodChange(value)}>
        <SelectTrigger className="min-h-10">
          <SelectValue placeholder="Method" />
        </SelectTrigger>
        <SelectContent>
          {methodOptions.map((item) => (
            <SelectItem key={item.value} value={item.value}>
              {item.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select value={dateRange} onValueChange={(value: DateRangeFilter) => onDateRangeChange(value)}>
        <SelectTrigger className="min-h-10">
          <SelectValue placeholder="Date Range" />
        </SelectTrigger>
        <SelectContent>
          {dateRangeOptions.map((item) => (
            <SelectItem key={item.value} value={item.value}>
              {item.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
