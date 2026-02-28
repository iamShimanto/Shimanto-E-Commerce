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

export const authApi = createApi({
  reducerPath: "authApi",
  baseQuery: axiosBaseQuery(),
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
        data: payload,
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
          data: formData,
          headers: { "Content-Type": "multipart/form-data" },
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
