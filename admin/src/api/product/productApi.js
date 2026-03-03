import { createApi } from "@reduxjs/toolkit/query/react";
import api from "../api";

export const productApi = createApi({
  reducerPath: "productApi",
  baseQuery: api,
  tagTypes: ["Products"],
  endpoints: (builder) => ({
    getProducts: builder.query({
      query: ({ page = 1, limit = 10, category, search } = {}) => ({
        url: "/api/v1/product/all",
        method: "GET",
        params: {
          page,
          limit,
          ...(category ? { category } : {}),
          ...(search ? { search } : {}),
        },
      }),
      transformResponse: (response) => ({
        items: response?.products ?? [],
        pagination: response?.pagination ?? null,
      }),
      providesTags: (result) =>
        result?.items?.length
          ? [
              { type: "Products", id: "LIST" },
              ...result.items
                .map((p) => p?._id)
                .filter(Boolean)
                .map((id) => ({ type: "Products", id })),
            ]
          : [{ type: "Products", id: "LIST" }],
    }),
    createProduct: builder.mutation({
      query: ({
        title,
        description,
        category,
        price,
        discountPercentage,
        variants,
        tags,
        isActive,
        thumbnailFile,
        imageFiles,
      }) => {
        const formData = new FormData();
        formData.append("title", title);
        formData.append("description", description);
        formData.append("category", category);
        formData.append("price", String(price));
        formData.append("discountPercentage", String(discountPercentage ?? 0));
        formData.append("variants", JSON.stringify(variants ?? []));
        formData.append("tags", JSON.stringify(tags ?? []));
        formData.append("isActive", String(isActive ?? true));

        if (thumbnailFile) formData.append("thumbnail", thumbnailFile);
        (imageFiles ?? []).forEach((f) => formData.append("images", f));

        return {
          url: "/api/v1/product/create",
          method: "POST",
          body: formData,
        };
      },
      invalidatesTags: [{ type: "Products", id: "LIST" }],
    }),
    getSingleProduct: builder.query({
      query: (slug) => ({
        url: `/api/v1/product/get-single-product/${slug}`,
        method: "GET",
      }),
      providesTags: ["Products"],
    }),
    updateProduct: builder.mutation({
      query: ({ slug, data }) => {
        const formData = new FormData();
        if (typeof data?.title !== "undefined")
          formData.append("title", data.title);
        if (typeof data?.description !== "undefined")
          formData.append("description", data.description);
        if (typeof data?.category !== "undefined")
          formData.append("category", data.category);
        if (typeof data?.price !== "undefined")
          formData.append("price", String(data.price));
        if (typeof data?.discountPercentage !== "undefined")
          formData.append(
            "discountPercentage",
            String(data.discountPercentage),
          );
        if (typeof data?.isActive !== "undefined")
          formData.append("isActive", String(data.isActive));
        if (Array.isArray(data?.variants))
          formData.append("variants", JSON.stringify(data.variants));
        if (Array.isArray(data?.tags))
          formData.append("tags", JSON.stringify(data.tags));

        if (Array.isArray(data?.destroyImages))
          formData.append("destroyImages", JSON.stringify(data.destroyImages));

        if (data?.thumbnailFile)
          formData.append("thumbnail", data.thumbnailFile);
        (data?.imageFiles ?? []).forEach((f) => formData.append("images", f));

        return {
          url: `/api/v1/product/update-product/${slug}`,
          method: "PUT",
          body: formData,
        };
      },
      invalidatesTags: [{ type: "Products", id: "LIST" }],
    }),
  }),
});

export const {
  useGetProductsQuery,
  useCreateProductMutation,
  useGetSingleProductQuery,
  useUpdateProductMutation,
} = productApi;
