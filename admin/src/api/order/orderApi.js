import { createApi } from "@reduxjs/toolkit/query/react";
import api from "../api";

export const orderApi = createApi({
  reducerPath: "orderApi",
  baseQuery: api,
  tagTypes: ["Order"],
  endpoints: (builder) => ({
    // get all orders
    getOrders: builder.query({
      query: ({ page = 1, limit = 10, search } = {}) => ({
        url: "/api/v1/order/all",
        method: "GET",
        params: {
          page,
          limit,
          ...(search ? { search } : {}),
        },
      }),
      providesTags: (result) =>
        result?.items?.length
          ? [
              { type: "Order", id: "LIST" },
              ...result.items
                .map((o) => o?._id)
                .filter(Boolean)
                .map((id) => ({ type: "Order", id })),
            ]
          : [{ type: "Order", id: "LIST" }],
      transformResponse: (response) => ({
        items: response?.data?.orders ?? [],
        pagination: response?.data?.pagination ?? null,
      }),
    }),
    // get order by id
    getOrderById: builder.query({
      query: (id) => ({
        url: `/api/v1/order/get-by-id/${id}`,
        method: "GET",
      }),
      providesTags: ["Order"],
      transformResponse: (response) => response?.data ?? null,
    }),
    // update order status
    updateOrderStatus: builder.mutation({
      query: ({ id, status }) => ({
        url: `/api/v1/order/update-status/${id}`,
        method: "put",
        body: { status },
      }),
      invalidatesTags: ["Order"],
    }),
  }),
});

export const {
  useGetOrdersQuery,
  useGetOrderByIdQuery,
  useUpdateOrderStatusMutation,
} = orderApi;
