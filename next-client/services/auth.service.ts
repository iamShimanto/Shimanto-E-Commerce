import { baseApi } from "@/store/services/base-api";
import type {
  ApiResponse,
  AuthSession,
  AuthUser,
  ChangePasswordPayload,
  LoginPayload,
  RegisterPayload,
  ResetPasswordPayload,
  ResetPasswordRequestPayload,
  UpdateProfilePayload,
  VerifyOtpPayload,
} from "@/types";

export const authApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    registerUser: builder.mutation<ApiResponse<null>, RegisterPayload>({
      query: (body) => ({
        url: "/auth/register",
        method: "POST",
        body,
      }),
      invalidatesTags: ["Auth"],
    }),
    verifyOtp: builder.mutation<ApiResponse<null>, VerifyOtpPayload>({
      query: (body) => ({
        url: "/auth/verifyotp",
        method: "POST",
        body,
      }),
    }),
    resendOtp: builder.mutation<ApiResponse<null>, { email: string }>({
      query: (body) => ({
        url: "/auth/resendotp",
        method: "POST",
        body,
      }),
    }),
    loginUser: builder.mutation<ApiResponse<AuthSession>, LoginPayload>({
      query: (body) => ({
        url: "/auth/login",
        method: "POST",
        body,
      }),
      invalidatesTags: ["Auth", "Profile"],
    }),
    logout: builder.mutation<ApiResponse<null>, void>({
      query: () => ({
        url: "/auth/logout",
        method: "POST",
      }),
      invalidatesTags: ["Auth", "Profile"],
    }),
    refreshToken: builder.mutation<{ success: boolean }, void>({
      query: () => ({
        url: "/auth/refreshtoken",
        method: "POST",
      }),
    }),
    getProfile: builder.query<ApiResponse<AuthUser>, void>({
      query: () => ({
        url: "/auth/profile",
        method: "GET",
      }),
      providesTags: ["Profile"],
    }),
    updateProfile: builder.mutation<
      ApiResponse<AuthUser>,
      FormData | UpdateProfilePayload
    >({
      query: (body) => ({
        url: "/auth/profile",
        method: "PUT",
        body,
      }),
      invalidatesTags: ["Profile"],
    }),
    changePassword: builder.mutation<ApiResponse<null>, ChangePasswordPayload>({
      query: (body) => ({
        url: "/auth/change-password",
        method: "PUT",
        body,
      }),
    }),
    requestPasswordReset: builder.mutation<
      ApiResponse<null>,
      ResetPasswordRequestPayload
    >({
      query: (body) => ({
        url: "/auth/resetpassword",
        method: "POST",
        body,
      }),
    }),
    resetPasswordChange: builder.mutation<ApiResponse<null>, ResetPasswordPayload>({
      query: ({ token, ...body }) => ({
        url: `/auth/resetpasswordchange/${token}`,
        method: "POST",
        body,
      }),
    }),
  }),
});

export const {
  useChangePasswordMutation,
  useGetProfileQuery,
  useLazyGetProfileQuery,
  useLoginUserMutation,
  useLogoutMutation,
  useRefreshTokenMutation,
  useRegisterUserMutation,
  useResendOtpMutation,
  useRequestPasswordResetMutation,
  useResetPasswordChangeMutation,
  useUpdateProfileMutation,
  useVerifyOtpMutation,
} = authApi;

export const useLoginMutation = useLoginUserMutation;
export const useRegisterMutation = useRegisterUserMutation;
export const useRequestResetPasswordMutation = useRequestPasswordResetMutation;
export const useResetPasswordMutation = useResetPasswordChangeMutation;
