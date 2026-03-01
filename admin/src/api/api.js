import { fetchBaseQuery } from "@reduxjs/toolkit/query/react";

const baseUrl = import.meta.env.VITE_API_URL ?? "";

const DEFAULT_TIMEOUT_MS = 10000;

const fetchWithTimeout = async (input, init) => {
  if (init?.signal) return fetch(input, init);

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), DEFAULT_TIMEOUT_MS);

  try {
    return await fetch(input, { ...init, signal: controller.signal });
  } finally {
    clearTimeout(timeoutId);
  }
};

let refreshPromise = null;

const rawBaseQuery = fetchBaseQuery({
  baseUrl,
  credentials: "include",
  fetchFn: fetchWithTimeout,
});

export const api = async (args, api, extraOptions) => {
  let result = await rawBaseQuery(args, api, extraOptions);

  if (result?.error?.status !== 401) return result;

  const requestUrl = typeof args === "string" ? args : args?.url;
  const isRefreshCall = (requestUrl || "").includes(
    "/api/v1/auth/refreshtoken",
  );

  if (isRefreshCall) return result;

  try {
    if (!refreshPromise) {
      refreshPromise = rawBaseQuery(
        { url: "/api/v1/auth/refreshtoken", method: "POST" },
        api,
        extraOptions,
      )
        .then((refreshResult) => !refreshResult?.error)
        .catch(() => false)
        .finally(() => {
          refreshPromise = null;
        });
    }

    const refreshed = await refreshPromise;
    if (!refreshed) return result;

    result = await rawBaseQuery(args, api, extraOptions);
    return result;
  } catch {
    return result;
  }
};

export default api;
