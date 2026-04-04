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
    // get all products with pagination, search, filter by category and sort by price
    getAllProducts: builder.query({
      query: ({ page = 1, limit = 12, search, category, sortPrice } = {}) => {
        const params = new URLSearchParams();

        params.set("page", String(page));
        params.set("limit", String(limit));
        params.set("isActive", "true");

        if (search) params.set("search", search);
        if (category) params.set("category", category);
        if (sortPrice) params.set("sortPrice", sortPrice); // "asc" or "desc"

        return {
          url: `/api/v1/product/all?${params.toString()}`,
          method: "GET",
        };
      },
      providesTags: ["Product"],
    }),
    // get product by slug
    getProductBySlug: builder.query({
      query: (slug) => ({
        url: `/api/v1/product/get-single-product/${slug}`,
        method: "GET",
      }),
      providesTags: ["Product"],
      transformResponse: (response) => response?.data ?? null,
    })
  }),
});

export const { useGetFeaturedProductsQuery, useGetAllProductsQuery, useGetProductBySlugQuery } =
  productsApi;
