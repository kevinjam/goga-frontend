import axiosInstance from "@/services/api/axiosInstance";
import type { PaymentMethod } from "@/types/reports";

export interface DashboardCollectionPoint {
  period: string;
  totalAmount: number;
  totalCount: number;
}

export interface PaymentMethodStat {
  method: PaymentMethod;
  totalAmount: number;
  totalCount: number;
}

export interface DashboardStatsApi {
  totalMembers: number;
  totalPayments: number;
  totalReceipts: number;
  totalRevenue: number;
  paymentsByMethod: PaymentMethodStat[];
  monthlyCollections: DashboardCollectionPoint[];
  dailyCollections: DashboardCollectionPoint[];
}

export const dashboardService = {
  async getStats(): Promise<DashboardStatsApi> {
    const response = await axiosInstance.get<DashboardStatsApi>("/dashboard/stats");
    return response.data;
  }
};

