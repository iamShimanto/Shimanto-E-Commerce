import { createApi } from "@reduxjs/toolkit/query/react";
import api from "../api";

export const authApi = createApi({
  reducerPath: "authApi",
  baseQuery: api,
  tagTypes: ["Auth", "Users"],
  endpoints: (builder) => ({
    register: builder.mutation({
      query: (payload) => ({
        url: "/api/v1/auth/register",
        method: "POST",
        body: payload,
      }),
      invalidatesTags: ["Auth"],
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
    profile: builder.query({
      query: () => ({
        url: "/api/v1/auth/profile",
        method: "GET",
      }),
      providesTags: ["Auth"],
      transformResponse: (response) => response ?? null,
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
    changePassword: builder.mutation({
      query: ({ currentPassword, newPassword }) => ({
        url: "/api/v1/auth/change-password",
        method: "PUT",
        body: { currentPassword, newPassword },
      }),
    }),
    verifyOtp: builder.mutation({
      query: (payload) => ({
        url: "/api/v1/auth/verifyotp",
        method: "POST",
        body: payload,
      }),
    }),
    resendOtp: builder.mutation({
      query: (payload) => ({
        url: "/api/v1/auth/resendotp",
        method: "POST",
        body: payload,
      }),
    }),
    resetPassword: builder.mutation({
      query: (payload) => ({
        url: "/api/v1/auth/resetpassword",
        method: "POST",
        body: payload,
      }),
    }),
    resetPasswordChange: builder.mutation({
      query: ({ token, newPassword }) => ({
        url: `/api/v1/auth/resetpasswordchange/${token}`,
        method: "POST",
        body: { newPassword },
      }),
    }),
  }),
});

export const {
  useRegisterMutation,
  useLoginMutation,
  useLogoutMutation,
  useProfileQuery,
  useUpdateProfileMutation,
  useChangePasswordMutation,
  useVerifyOtpMutation,
  useResendOtpMutation,
  useResetPasswordMutation,
  useResetPasswordChangeMutation,
} = authApi;
