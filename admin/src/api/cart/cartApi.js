import { createApi } from "@reduxjs/toolkit/query/react";
import api from "../api";

export const cartApi = createApi({
  reducerPath: "cartApi",
  baseQuery: api,
  tagTypes: ["Cart"],
  endpoints: (builder) => ({
    totalCarts: builder.query({
      query: ({ page = 1, limit = 10, search = "" }) => ({
        url: "/api/v1/cart/total-carts",
        method: "GET",
        params: { page, limit, search },
      }),
      transformResponse: (response) => response?.data ?? null,
      providesTags: (result) =>
        result?.data?.length
          ? [
              { type: "Cart", id: "LIST" },
              ...result.data
                .map((c) => c?._id)
                .filter(Boolean)
                .map((id) => ({ type: "Cart", id })),
            ]
          : [{ type: "Cart", id: "LIST" }],
    }),
  }),
});

export const { useTotalCartsQuery } = cartApi;
