import { createApi } from "@reduxjs/toolkit/query/react";
import api from "../api";

export const cartApi = createApi({
  reducerPath: "cartApi",
  baseQuery: api,
  tagTypes: ["Cart"],
  endpoints: (builder) => ({
    addToCart: builder.mutation({
      query: ({ productId, sku, quantity }) => ({
        url: "/api/v1/cart/add",
        method: "POST",
        body: { productId, sku, quantity },
      }),
      invalidatesTags: ["Cart"],
    }),
    getCart: builder.query({
      query: () => ({
        url: "/api/v1/cart",
        method: "GET",
      }),
      providesTags: ["Cart"],
      transformResponse: (response) => response?.data ?? null,
    }),
    updateCart: builder.mutation({
      query: ({ productId, sku, quantity }) => ({
        url: "/api/v1/cart/update",
        method: "PUT",
        body: { productId, sku, quantity },
      }),
      invalidatesTags: ["Cart"],
    }),
    removeFromCart: builder.mutation({
      query: ({ productId, sku }) => ({
        url: "/api/v1/cart/remove",
        method: "DELETE",
        body: { productId, sku },
      }),
      invalidatesTags: ["Cart"],
    }),
    clearCart: builder.mutation({
      query: () => ({
        url: "/api/v1/cart/clear",
        method: "DELETE",
      }),
      invalidatesTags: ["Cart"],
    }),
  }),
});

export const {
  useAddToCartMutation,
  useGetCartQuery,
  useUpdateCartMutation,
  useRemoveFromCartMutation,
  useClearCartMutation,
} = cartApi;
