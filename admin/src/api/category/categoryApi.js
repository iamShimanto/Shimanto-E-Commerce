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
    // create new category
    createCategory: builder.mutation({
      query: ({ name, description, thumbnail }) => {
        const formData = new FormData();
        formData.append("name", name);
        if (description) formData.append("description", description);
        formData.append("thumbnail", thumbnail);
        return {
          url: "/api/v1/category/create",
          method: "POST",
          body: formData,
        };
      },
      invalidatesTags: [{ type: "Category", id: "LIST" }],
    }),
    // update category
    updateCategory: builder.mutation({
      query: ({ slug, name, description, isActive, thumbnail }) => {
        const formData = new FormData();
        if (typeof name !== "undefined") formData.append("name", name);
        if (typeof description !== "undefined")
          formData.append("description", description);
        if (typeof isActive !== "undefined")
          formData.append("isActive", String(isActive));
        if (thumbnail) formData.append("thumbnail", thumbnail);

        return {
          url: `/api/v1/category/update/${slug}`,
          method: "PUT",
          body: formData,
        };
      },
      invalidatesTags: ["Category"],
    }),
  }),
});

export const {
  useCreateCategoryMutation,
  useGetCategoriesQuery,
  useUpdateCategoryMutation,
} = categoryApi;
