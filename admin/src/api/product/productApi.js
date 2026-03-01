import { createApi } from "@reduxjs/toolkit/query/react";
import api from "../api";

export const productApi = createApi({
  reducerPath: "productApi",
  baseQuery: api,
  tagTypes: ["Products"],
  endpoints: (builder) => ({
    getProducts: builder.query({
      query: () => ({
        url: "/api/v1/product/all",
        method: "GET",
      }),
      providesTags: ["Products"],
    }),
    createProduct: builder.mutation({
      query: (data) => ({
        url: "/api/v1/product/create",
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["Products"],
    }),
    getSingleProduct: builder.query({
      query: (slug) => ({
        url: `/api/v1/product/get-single-product/${slug}`,
        method: "GET",
      }),
      providesTags: ["Products"],
    }),
    updateProduct: builder.mutation({
      query: ({ slug, data }) => ({
        url: `/api/v1/product/update-product/${slug}`,
        method: "PUT",
        body: data,
      }),
      invalidatesTags: ["Products"],
    }),
  }),
});

export const {
  useGetProductsQuery,
  useCreateProductMutation,
  useGetSingleProductQuery,
  useUpdateProductMutation,
} = productApi;
