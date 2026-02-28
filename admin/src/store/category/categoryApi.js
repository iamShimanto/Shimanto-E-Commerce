import { createApi } from "@reduxjs/toolkit/query/react";

import api from "../../api/api";

const axiosBaseQuery =
  () =>
  async ({ url, method, data, params, headers }) => {
    try {
      const result = await api({
        url,
        method,
        data,
        params,
        headers,
      });

      return { data: result.data };
    } catch (axiosError) {
      const status = axiosError?.response?.status;
      const errorData = axiosError?.response?.data || axiosError?.message;

      return {
        error: {
          status,
          data: errorData,
        },
      };
    }
  };

export const categoryApi = createApi({
  reducerPath: "categoryApi",
  baseQuery: axiosBaseQuery(),
  tagTypes: ["Category"],
  endpoints: (builder) => ({
    getCategories: builder.query({
      query: () => ({
        url: "/api/v1/category/all",
        method: "GET",
      }),
      providesTags: (result) =>
        result
          ? [
              { type: "Category", id: "LIST" },
              ...result.map((c) => ({ type: "Category", id: c._id })),
            ]
          : [{ type: "Category", id: "LIST" }],
      transformResponse: (response) => response?.data ?? [],
    }),

    createCategory: builder.mutation({
      query: ({ name, description, thumbnail }) => {
        const formData = new FormData();
        formData.append("name", name);
        if (description) formData.append("description", description);
        formData.append("thumbnail", thumbnail);

        return {
          url: "/api/v1/category/create",
          method: "POST",
          data: formData,
          headers: { "Content-Type": "multipart/form-data" },
        };
      },
      invalidatesTags: [{ type: "Category", id: "LIST" }],
    }),

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
          data: formData,
          headers: { "Content-Type": "multipart/form-data" },
        };
      },
      invalidatesTags: (_result, _error, arg) => [
        { type: "Category", id: "LIST" },
        { type: "Category", id: arg?.slug },
      ],
    }),
  }),
});

export const {
  useCreateCategoryMutation,
  useGetCategoriesQuery,
  useUpdateCategoryMutation,
} = categoryApi;
