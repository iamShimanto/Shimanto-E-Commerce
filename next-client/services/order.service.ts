import { baseApi } from "@/store/services/base-api";
import type { ApiResponse } from "@/types";

export type OrderPaymentMethod = "cod" | "stripe" | "sslcommerz";
export type OrderPaymentStatus = "pending" | "paid" | "failed" | "refunded";
export type OrderStatus =
  | "pending"
  | "confirmed"
  | "processing"
  | "shipped"
  | "delivered"
  | "cancelled";

export type OrderUser = {
  _id?: string;
  fullName?: string | null;
  email?: string | null;
  role?: string | null;
  avatar?: string | null;
};

export type OrderShippingAddress = {
  fullName?: string;
  phone?: string;
  email?: string;
  address?: string;
};

export type OrderItem = {
  product?: string;
  sku?: string;
  title?: string;
  price?: number;
  quantity?: number;
  subTotal?: number;
  thumbnail?: string;
};

export type AdminOrder = {
  _id?: string;
  id?: string;
  user?: OrderUser | null;
  userId?: string | null;
  items?: OrderItem[];
  shippingAddress?: OrderShippingAddress;
  paymentMethod?: OrderPaymentMethod | string;
  paymentStatus?: OrderPaymentStatus | string;
  orderStatus?: OrderStatus | string;
  subTotal?: number;
  shippingFee?: number;
  tax?: number;
  discount?: number;
  totalAmount?: number;
  currency?: string;
  transactionId?: string;
  inventoryAdjusted?: boolean;
  gatewayResponse?: Record<string, unknown>;
  createdAt?: string;
  updatedAt?: string;
};

export type AdminOrderPagination = {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
};

export type AdminOrderListPayload = {
  orders: AdminOrder[];
  pagination: AdminOrderPagination;
};

export const orderApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getAdminOrders: builder.query<
      ApiResponse<AdminOrderListPayload>,
      { page?: number; limit?: number; search?: string } | void
    >({
      query: (params) => ({
        url: "/order/all",
        method: "GET",
        params: {
          page: params?.page ?? 1,
          limit: params?.limit ?? 10,
          ...(params?.search ? { search: params.search } : {}),
        },
      }),
      providesTags: (result) => {
        const orders = result?.data?.orders ?? [];

        return orders.length
          ? [
              { type: "Order" as const, id: "LIST" },
              ...orders
                .map((order) => order?._id)
                .filter(Boolean)
                .map((id) => ({ type: "Order" as const, id })),
            ]
          : [{ type: "Order" as const, id: "LIST" }];
      },
    }),
    getAdminOrderById: builder.query<ApiResponse<AdminOrder>, string>({
      query: (id) => ({
        url: `/order/admin/get-by-id/${id}`,
        method: "GET",
      }),
      providesTags: (_result, _error, id) => [{ type: "Order" as const, id }],
    }),
    updateOrderStatus: builder.mutation<
      ApiResponse<AdminOrder>,
      { id: string; status: string }
    >({
      query: ({ id, status }) => ({
        url: `/order/update-status/${id}`,
        method: "PUT",
        body: { status },
      }),
      invalidatesTags: (_result, _error, { id }) => [
        { type: "Order" as const, id },
        { type: "Order" as const, id: "LIST" },
      ],
    }),
  }),
});

export const {
  useGetAdminOrderByIdQuery,
  useGetAdminOrdersQuery,
  useUpdateOrderStatusMutation,
} = orderApi;