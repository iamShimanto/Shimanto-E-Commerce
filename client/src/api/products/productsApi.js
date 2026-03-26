import { createApi } from "@reduxjs/toolkit/query/react";
import api from "../api";

export const productsApi = createApi({
  reducerPath: "productsApi",
  baseQuery: api,
  tagTypes: ["Product"],
  endpoints: (builder) => ({
    getFeaturedProducts: builder.query({
      query: () => ({
        url: "/api/v1/product/featured",
        method: "GET",
      }),
      providesTags: ["Product"],
      transformResponse: (response) => response?.data ?? [],
    }),
  }),
});

export const { useGetFeaturedProductsQuery } = productsApi;
