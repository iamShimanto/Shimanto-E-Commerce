import { baseApi } from "@/store/services/base-api";
import type { ApiResponse } from "@/types";
import { AdminProduct, AdminProductListResponse, GetAdminProductsParams, UpsertProductPayload } from "@/types/product.types";


export function buildProductFormData(payload: UpsertProductPayload) {
  const formData = new FormData();

  formData.append("title", payload.title);
  formData.append("description", payload.description);
  formData.append("category", payload.category);
  formData.append("price", String(payload.price));

  if (typeof payload.discountPercentage !== "undefined") {
    formData.append("discountPercentage", String(payload.discountPercentage));
  }

  formData.append("variants", JSON.stringify(payload.variants ?? []));
  formData.append("tags", JSON.stringify(payload.tags ?? []));

  if (typeof payload.isActive === "boolean") {
    formData.append("isActive", payload.isActive ? "true" : "false");
  }

  if (payload.thumbnail) {
    formData.append("thumbnail", payload.thumbnail);
  }

  (payload.images ?? []).forEach((image) => {
    formData.append("images", image);
  });

  if (Array.isArray(payload.destroyImages) && payload.destroyImages.length > 0) {
    formData.append("destroyImages", JSON.stringify(payload.destroyImages));
  }

  return formData;
}

export const productApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getAdminProducts: builder.query<AdminProductListResponse, GetAdminProductsParams | void>({
      query: (params) => ({
        url: "/product/all",
        method: "GET",
        params: {
          page: params?.page ?? 1,
          limit: params?.limit ?? 10,
          ...(params?.category ? { category: params.category } : {}),
          ...(params?.search ? { search: params.search } : {}),
          ...(params?.isActive ? { isActive: params.isActive } : {}),
          ...(params?.sortPrice ? { sortPrice: params.sortPrice } : {}),
        },
      }),
      providesTags: (result) => {
        const products = result?.products ?? [];

        return products.length
          ? [
              { type: "Product" as const, id: "LIST" },
              ...products
                .map((product) => product?.slug || product?._id || product?.id)
                .filter(Boolean)
                .map((id) => ({ type: "Product" as const, id })),
            ]
          : [{ type: "Product" as const, id: "LIST" }];
      },
    }),

    getProductBySlug: builder.query<ApiResponse<AdminProduct>, string>({
      query: (slug) => ({
        url: `/product/get-single-product/${slug}`,
        method: "GET",
      }),
      providesTags: (_result, _error, slug) => [
        { type: "Product" as const, id: slug },
      ],
    }),

    createProduct: builder.mutation<ApiResponse<AdminProduct>, FormData>({
      query: (body) => ({
        url: "/product/create",
        method: "POST",
        body,
      }),
      invalidatesTags: [{ type: "Product" as const, id: "LIST" }],
    }),

    updateProduct: builder.mutation<
      ApiResponse<AdminProduct>,
      { slug: string; body: FormData }
    >({
      query: ({ slug, body }) => ({
        url: `/product/update-product/${slug}`,
        method: "PUT",
        body,
      }),
      invalidatesTags: (_result, _error, { slug }) => [
        { type: "Product" as const, id: slug },
        { type: "Product" as const, id: "LIST" },
      ],
    }),

    toggleProductFeatured: builder.mutation<ApiResponse<AdminProduct>, string>({
      query: (slug) => ({
        url: `/product/is-featured/${slug}`,
        method: "PUT",
      }),
      invalidatesTags: (_result, _error, slug) => [
        { type: "Product" as const, id: slug },
        { type: "Product" as const, id: "LIST" },
      ],
    }),
  }),
});

export const {
  useGetAdminProductsQuery,
  useGetProductBySlugQuery,
  useCreateProductMutation,
  useUpdateProductMutation,
  useToggleProductFeaturedMutation,
} = productApi;
