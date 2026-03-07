import { createApi } from "@reduxjs/toolkit/query/react";
import api from "../api";

export const subscriptionApi = createApi({
  reducerPath: "subscriptionApi",
  baseQuery: api,
  tagTypes: ["Subscription"],
  endpoints: (builder) => ({
    getSubscriptions: builder.query({
      query: ({ page = 1, limit = 20, search = "" } = {}) => ({
        url: "/api/v1/subscription/get",
        method: "GET",
        params: {
          page,
          limit,
          ...(search && search.trim() ? { search: search.trim() } : {}),
        },
      }),
      transformResponse: (response) =>
        response?.data || { items: [], pagination: null },
      providesTags: (result) => {
        const items = Array.isArray(result?.items) ? result.items : [];
        const ids = items.map((item) => item?._id).filter(Boolean);

        return items.length
          ? [
              { type: "Subscription", id: "LIST" },
              ...ids.map((id) => ({ type: "Subscription", id })),
            ]
          : [{ type: "Subscription", id: "LIST" }];
      },
    }),

    createSubscription: builder.mutation({
      query: (email) => ({
        url: "/api/v1/subscription/create",
        method: "POST",
        body: { email },
      }),
      invalidatesTags: [{ type: "Subscription", id: "LIST" }],
    }),

    deleteSubscription: builder.mutation({
      query: (email) => ({
        url: "/api/v1/subscription/delete",
        method: "DELETE",
        body: { email },
      }),
      invalidatesTags: [{ type: "Subscription", id: "LIST" }],
    }),
  }),
});

export const {
  useGetSubscriptionsQuery,
  useCreateSubscriptionMutation,
  useDeleteSubscriptionMutation,
} = subscriptionApi;
