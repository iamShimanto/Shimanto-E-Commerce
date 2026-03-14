import { createApi } from "@reduxjs/toolkit/query/react";
import api from "../api";

export const categoryApi = createApi({
  reducerPath: "categoryApi",
  baseQuery: api,
  tagTypes: ["Category"],
  endpoints: (builder) => ({
    // get all categories
    getCategories: builder.query({
      query: () => ({
        url: "/api/v1/category/all",
        method: "GET",
      }),
      providesTags: ["Category"],
      transformResponse: (response) => response?.data ?? [],
    }),
  }),
});

export const { useGetCategoriesQuery } = categoryApi;
