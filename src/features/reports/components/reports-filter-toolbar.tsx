"use client";

import { ChevronDown } from "lucide-react";
import { useState } from "react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { PaymentMethod } from "@/types/reports";

export type DatePreset = "7d" | "30d" | "month" | "custom";
export type StatusDimension = "all" | "matched" | "unmatched";

interface ReportsFilterToolbarProps {
  datePreset: DatePreset;
  category: string;
  department: string;
  status: StatusDimension;
  paymentMethod: "all" | PaymentMethod;
  customStartDate: string;
  customEndDate: string;
  isExporting: "excel" | "pdf" | null;
  onDatePresetChange: (value: DatePreset) => void;
  onCategoryChange: (value: string) => void;
  onDepartmentChange: (value: string) => void;
  onStatusChange: (value: StatusDimension) => void;
  onPaymentMethodChange: (value: "all" | PaymentMethod) => void;
  onCustomStartDateChange: (value: string) => void;
  onCustomEndDateChange: (value: string) => void;
  onExport: (format: "excel" | "pdf") => void;
}

export function ReportsFilterToolbar(props: ReportsFilterToolbarProps) {
  const [filtersExpanded, setFiltersExpanded] = useState(false);

  return (
    <div className="sticky top-14 z-10 space-y-3 rounded-lg border border-border bg-card/95 p-4 backdrop-blur sm:top-16">
      <div className="flex items-center justify-between gap-3 lg:hidden">
        <Button
          type="button"
          variant="outline"
          className="min-h-10 flex-1 justify-between"
          onClick={() => setFiltersExpanded((open) => !open)}
          aria-expanded={filtersExpanded}
        >
          Filters
          <ChevronDown
            className={`h-4 w-4 transition-transform ${filtersExpanded ? "rotate-180" : ""}`}
          />
        </Button>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="min-h-10">
              Export
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem
              disabled={props.isExporting !== null}
              onSelect={() => props.onExport("excel")}
            >
              {props.isExporting === "excel" ? "Exporting Excel..." : "Export Excel"}
            </DropdownMenuItem>
            <DropdownMenuItem
              disabled={props.isExporting !== null}
              onSelect={() => props.onExport("pdf")}
            >
              {props.isExporting === "pdf" ? "Exporting PDF..." : "Export PDF"}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <div className={`space-y-3 ${filtersExpanded ? "block" : "hidden"} lg:block`}>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
          <Select value={props.datePreset} onValueChange={(v: DatePreset) => props.onDatePresetChange(v)}>
            <SelectTrigger className="min-h-10"><SelectValue placeholder="Date range" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="7d">Last 7 Days</SelectItem>
              <SelectItem value="30d">Last 30 Days</SelectItem>
              <SelectItem value="month">This Month</SelectItem>
              <SelectItem value="custom">Custom Range</SelectItem>
            </SelectContent>
          </Select>

          <Input
            value={props.category}
            onChange={(e) => props.onCategoryChange(e.target.value)}
            placeholder="Category"
            className="min-h-10"
          />
          <Input
            value={props.department}
            onChange={(e) => props.onDepartmentChange(e.target.value)}
            placeholder="Department"
            className="min-h-10"
          />

          <Select value={props.status} onValueChange={(v: StatusDimension) => props.onStatusChange(v)}>
            <SelectTrigger className="min-h-10"><SelectValue placeholder="Status" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="matched">Matched</SelectItem>
              <SelectItem value="unmatched">Unmatched</SelectItem>
            </SelectContent>
          </Select>

          <Select
            value={props.paymentMethod}
            onValueChange={(v: "all" | PaymentMethod) => props.onPaymentMethodChange(v)}
          >
            <SelectTrigger className="min-h-10"><SelectValue placeholder="Payment method" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Methods</SelectItem>
              <SelectItem value="BANK">Bank</SelectItem>
              <SelectItem value="MTN_MOMO">MTN MoMo</SelectItem>
              <SelectItem value="AIRTEL_MONEY">Airtel Money</SelectItem>
              <SelectItem value="CASH">Cash</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {props.datePreset === "custom" ? (
          <div className="grid gap-3 sm:grid-cols-2">
            <Input
              type="date"
              value={props.customStartDate}
              onChange={(e) => props.onCustomStartDateChange(e.target.value)}
              className="min-h-10"
            />
            <Input
              type="date"
              value={props.customEndDate}
              onChange={(e) => props.onCustomEndDateChange(e.target.value)}
              className="min-h-10"
            />
          </div>
        ) : null}
      </div>

      <div className="hidden justify-end lg:flex">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="min-h-10">Export</Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem
              disabled={props.isExporting !== null}
              onSelect={() => props.onExport("excel")}
            >
              {props.isExporting === "excel" ? "Exporting Excel..." : "Export Excel"}
            </DropdownMenuItem>
            <DropdownMenuItem
              disabled={props.isExporting !== null}
              onSelect={() => props.onExport("pdf")}
            >
              {props.isExporting === "pdf" ? "Exporting PDF..." : "Export PDF"}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}
