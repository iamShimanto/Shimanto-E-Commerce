import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import type {
  BaseQueryApi,
  BaseQueryFn,
  FetchArgs,
  FetchBaseQueryError,
} from "@reduxjs/toolkit/query";

const baseUrl =
  process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:5000/api/v1";

const rawBaseQuery = fetchBaseQuery({
  baseUrl,
  credentials: "include",
});

type RefreshAttempt = {
  refreshed: boolean;
  error?: FetchBaseQueryError;
};

let refreshTokenRequest: Promise<RefreshAttempt> | null = null;
let logoutRequest: Promise<boolean> | null = null;
let refreshTokenUnavailable = false;

function isAuthSessionMutation(endpoint: string) {
  return [
    "/auth/login",
    "/auth/logout",
    "/auth/register",
    "/auth/verifyotp",
    "/auth/resendotp",
    "/auth/refreshtoken",
  ].some((path) => endpoint.includes(path));
}

function isMissingRefreshTokenError(error: FetchBaseQueryError) {
  if (error.status !== 400) return false;
  const data = (error as { data?: unknown }).data;
  if (!data || typeof data !== "object") return false;
  const message = "message" in data ? String((data as { message?: unknown }).message ?? "") : "";
  return message.toLowerCase().includes("missing refresh");
}

const triggerLogout = async (
  api: BaseQueryApi,
  extraOptions: Parameters<typeof rawBaseQuery>[2],
) => {
  if (!logoutRequest) {
    logoutRequest = (async () => {
      const logoutResult = await rawBaseQuery(
        {
          url: "/auth/logout",
          method: "POST",
        },
        api,
        extraOptions,
      );
      if (!logoutResult.error) {
        api.dispatch(baseApi.util.resetApiState());
      }
      return !logoutResult.error;
    })().finally(() => {
      logoutRequest = null;
    });
  }
  return logoutRequest;
};

const baseQueryWithReauth: BaseQueryFn<
  string | FetchArgs,
  unknown,
  FetchBaseQueryError
> = async (args, api, extraOptions) => {
  const endpoint = typeof args === "string" ? args : args.url;
  let result = await rawBaseQuery(args, api, extraOptions);

  if (!result.error && isAuthSessionMutation(endpoint)) {
    refreshTokenUnavailable = false;
  }

  if (
    result.error?.status === 401 &&
    !endpoint.includes("/auth/refreshtoken")
  ) {
    if (refreshTokenUnavailable) {
      return result;
    }

    if (!refreshTokenRequest) {
      refreshTokenRequest = (async () => {
        const refreshResult = await rawBaseQuery(
          {
            url: "/auth/refreshtoken",
            method: "POST",
          },
          api,
          extraOptions,
        );

        if (refreshResult.error) {
          if (isMissingRefreshTokenError(refreshResult.error)) {
            refreshTokenUnavailable = true;
          }

          return {
            refreshed: false,
            error: refreshResult.error,
          };
        }

        return {
          refreshed: true,
        };
      })().finally(() => {
        refreshTokenRequest = null;
      });
    }
    const refreshAttempt = await refreshTokenRequest;
    if (refreshAttempt.refreshed) {
      refreshTokenUnavailable = false;
      result = await rawBaseQuery(args, api, extraOptions);
    } else {
      if (refreshAttempt.error && isMissingRefreshTokenError(refreshAttempt.error)) {
        refreshTokenUnavailable = true;
        return {
          error: refreshAttempt.error,
        };
      }

      await triggerLogout(api, extraOptions);
      if (refreshAttempt.error) {
        if (isMissingRefreshTokenError(refreshAttempt.error)) {
          refreshTokenUnavailable = true;
        }

        return {
          error: refreshAttempt.error,
        };
      }
    }
  }
  return result;
};

export const baseApi = createApi({
  reducerPath: "api",
  baseQuery: baseQueryWithReauth,
  tagTypes: [
    "Auth",
    "Profile",
    "Cart",
    "Category",
    "Order",
    "Product",
    "Settings",
    "Subscription",
  ],
  endpoints: () => ({}),
});
