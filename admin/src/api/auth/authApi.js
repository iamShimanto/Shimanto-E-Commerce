import { createApi } from "@reduxjs/toolkit/query/react";

import api from "../api";

export const authApi = createApi({
  reducerPath: "authApi",
  baseQuery: api,
  tagTypes: ["Auth", "Users"],
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
    getUsers: builder.query({
      query: ({
        page = 1,
        limit = 10,
        search,
        role,
        isVerified,
        hasAvatar,
        sortBy,
        sortOrder,
      } = {}) => ({
        url: "/api/v1/auth/all-users",
        method: "GET",
        params: {
          page,
          limit,
          ...(search ? { search } : {}),
          ...(role ? { role } : {}),
          ...(typeof isVerified !== "undefined" ? { isVerified } : {}),
          ...(typeof hasAvatar !== "undefined" ? { hasAvatar } : {}),
          ...(sortBy ? { sortBy } : {}),
          ...(sortOrder ? { sortOrder } : {}),
        },
      }),
      transformResponse: (response) => response?.data ?? null,
      providesTags: (result) =>
        result?.items?.length
          ? [
              { type: "Users", id: "LIST" },
              ...result.items
                .map((u) => u?._id)
                .filter(Boolean)
                .map((id) => ({ type: "Users", id })),
            ]
          : [{ type: "Users", id: "LIST" }],
    }),

    updateRole: builder.mutation({
      query: ({ id, role }) => ({
        url: `/api/v1/auth/update-role/${id}`,
        method: "PUT",
        params: { role },
      }),
      invalidatesTags: (result, error, arg) =>
        error
          ? []
          : [
              { type: "Users", id: "LIST" },
              ...(arg?.id ? [{ type: "Users", id: arg.id }] : []),
            ],
    }),
    changePassword: builder.mutation({
      query: ({ currentPassword, newPassword }) => ({
        url: "/api/v1/auth/change-password",
        method: "PUT",
        body: { currentPassword, newPassword },
      }),
    }),
    getUserById: builder.query({
      query: (id) => ({
        url: `/api/v1/auth/user/${id}`,
        method: "GET",
      }),
      transformResponse: (response) => response?.data ?? null,
      providesTags: (result, error, id) =>
        result ? [{ type: "Users", id }] : [],
    }),
    verifyUser: builder.mutation({
      query: (id) => ({
        url: `/api/v1/auth/verify-user/${id}`,
        method: "PUT",
      }),
      invalidatesTags: (result, error, id) =>
        error ? [] : [{ type: "Users", id }],
    }),
  }),
});

export const {
  useLoginMutation,
  useLogoutMutation,
  useProfileQuery,
  useUpdateProfileMutation,
  useGetUsersQuery,
  useUpdateRoleMutation,
  useChangePasswordMutation,
  useGetUserByIdQuery,
  useVerifyUserMutation,
} = authApi;
