import { createApi } from "@reduxjs/toolkit/query/react";

import api from "../api";

export const authApi = createApi({
  reducerPath: "authApi",
  baseQuery: api,
  tagTypes: ["Auth"],
  endpoints: (builder) => ({
    profile: builder.query({
      query: () => ({
        url: "/api/v1/auth/profile",
        method: "GET",
      }),
      providesTags: ["Auth"],
      transformResponse: (response) => response?.data ?? null,
    }),

    login: builder.mutation({
      query: (payload) => ({
        url: "/api/v1/auth/login",
        method: "POST",
        body: payload,
      }),
      invalidatesTags: ["Auth"],
    }),

    logout: builder.mutation({
      query: () => ({
        url: "/api/v1/auth/logout",
        method: "POST",
      }),
      invalidatesTags: ["Auth"],
    }),

    updateProfile: builder.mutation({
      query: ({ fullName, phone, address, avatar }) => {
        const formData = new FormData();
        if (fullName) formData.append("fullName", fullName);
        if (phone) formData.append("phone", phone);
        if (address) formData.append("address", address);
        if (avatar) formData.append("avatar", avatar);

        return {
          url: "/api/v1/auth/profile",
          method: "PUT",
          body: formData,
        };
      },
      invalidatesTags: ["Auth"],
    }),
  }),
});

export const {
  useLoginMutation,
  useLogoutMutation,
  useProfileQuery,
  useUpdateProfileMutation,
} = authApi;
