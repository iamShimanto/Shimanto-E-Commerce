import { baseApi } from "@/store/services/base-api";
import type { ApiResponse, AuthUser } from "@/types";

export type DashboardSummary = {
  users: {
    total: number;
    verified: number;
    roles: Record<string, number>;
  };
  products: {
    total: number;
    active: number;
    featured: number;
    lowStock: number;
  };
  categories: {
    total: number;
    active: number;
  };
  orders: {
    total: number;
    statuses: Record<string, number>;
    paymentStatuses: Record<string, number>;
    paymentMethods: Record<string, number>;
  };
  subscriptions: {
    total: number;
  };
  carts: {
    total: number;
    items: number;
  };
  revenue: {
    paidRevenue: number;
    paidOrders: number;
    averageOrderValue: number;
    itemsSold: number;
  };
};

export type DashboardMonthlySales = {
  period: string;
  orders: number;
  paidOrders: number;
  revenue: number;
};

export type DashboardTopProduct = {
  productId: string;
  title: string | null;
  slug: string | null;
  thumbnail: string | null;
  categoryId: string | null;
  categoryName: string | null;
  soldQuantity: number;
  revenue: number;
  orderCount: number;
};

export type DashboardTopCategory = {
  categoryId: string | null;
  name: string | null;
  slug: string | null;
  thumbnail: string | null;
  soldQuantity: number;
  revenue: number;
  productsCount: number;
};

export type DashboardRecentOrder = {
  id: string;
  transactionId: string | null;
  orderStatus: string;
  paymentStatus: string;
  totalAmount: number;
  currency: string;
  createdAt: string;
  customer: {
    id: string | null;
    name: string;
    email: string | null;
    role: string | null;
    avatar: string | null;
  };
};

export type DashboardRecentUser = Pick<
  AuthUser,
  "fullName" | "email" | "role" | "isVerified" | "avatar"
> & {
  _id: string;
  createdAt: string;
};

export type DashboardLowStockProduct = {
  _id: string;
  title: string;
  slug: string;
  thumbnail: string;
  totalStock: number;
  isActive: boolean;
  isFeatured: boolean;
};

export type DashboardStatsData = {
  generatedAt: string;
  summary: DashboardSummary;
  charts: {
    monthlySales: DashboardMonthlySales[];
  };
  topProducts: DashboardTopProduct[];
  topCategories: DashboardTopCategory[];
  recentOrders: DashboardRecentOrder[];
  recentUsers: DashboardRecentUser[];
  lowStockProducts: DashboardLowStockProduct[];
};

export const statsApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getDashboardStats: builder.query<ApiResponse<DashboardStatsData>, void>({
      query: () => ({
        url: "/stats/dashboard",
        method: "GET",
      }),
    }),
  }),
});

export const { useGetDashboardStatsQuery } = statsApi;
