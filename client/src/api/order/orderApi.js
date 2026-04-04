import { createApi } from "@reduxjs/toolkit/query/react";
import api from "../api";

export const orderApi = createApi({
  reducerPath: "orderApi",
  baseQuery: api,
  tagTypes: ["Order"],
  endpoints: (builder) => ({
    checkout: builder.mutation({
      query: ({ shippingAddress, paymentMethod, insideDhaka }) => ({
        url: "/api/v1/order/checkout",
        method: "POST",
        body: { shippingAddress, paymentMethod, insideDhaka },
      }),
      invalidatesTags: ["Order"],
    }),
    // get all orders
    getOrders: builder.query({
      query: () => ({
        url: "/api/v1/order/get-all",
        method: "GET",
      }),
      providesTags: ["Order"],
      transformResponse: (response) => response?.data ?? [],
    }),
    // get order by id
    getOrderById: builder.query({
      query: (id) => ({
        url: `/api/v1/order/get-by-id/${id}`,
        method: "GET",
      }),
      providesTags: ["Order"],
      transformResponse: (response) => response?.data ?? [],
    }),
    // cancel order
    cancelOrder: builder.mutation({
        query: (id) => ({
            url: `/api/v1/order/cancel/${id}`,
            method: "put",
        }),
        invalidatesTags: ["Order"],
    })
  }),
});

export const {
  useCheckoutMutation,
  useGetOrdersQuery,
  useGetOrderByIdQuery,
  useCancelOrderMutation,
} = orderApi;