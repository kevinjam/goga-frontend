import axiosInstance from "@/services/api/axiosInstance";
import type { ReportFilters, ReportResult } from "@/types/reports";

function toQuery(filters: ReportFilters): Record<string, string | number> {
  const query: Record<string, string | number> = {};
  if (filters.startDate) query.startDate = filters.startDate;
  if (filters.endDate) query.endDate = filters.endDate;
  if (filters.paymentMethod) query.paymentMethod = filters.paymentMethod;
  if (filters.member) query.member = filters.member;
  if (filters.memberId) query.memberId = filters.memberId;
  if (filters.receiptNumber) query.receiptNumber = filters.receiptNumber;
  if (filters.page) query.page = filters.page;
  if (filters.limit) query.limit = filters.limit;
  return query;
}

function downloadBlob(blob: Blob, fileName: string) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

export const reportsService = {
  async getReportMetrics(
    filters: ReportFilters,
    signal?: AbortSignal
  ): Promise<ReportResult> {
    const response = await axiosInstance.get<ReportResult>("/reports", {
      params: toQuery(filters),
      signal
    });
    return response.data;
  },

  async exportReportData(filters: ReportFilters, format: "excel" | "pdf"): Promise<void> {
    const endpoint = format === "excel" ? "/reports/export/excel" : "/reports/export/pdf";
    const response = await axiosInstance.get(endpoint, {
      params: toQuery(filters),
      responseType: "blob"
    });

    const fileName = `report-${new Date().toISOString().slice(0, 10)}.${
      format === "excel" ? "xlsx" : "pdf"
    }`;
    downloadBlob(response.data as Blob, fileName);
  }
};
