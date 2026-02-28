import axios from "axios";

export const baseUrl = import.meta.env.VITE_API_URL;

const api = axios.create({
  baseURL: baseUrl,
  withCredentials: true,
  timeout: 10000,
});

let refreshPromise = null;

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // If there is no config, just bubble up.
    if (!originalRequest) return Promise.reject(error);

    const status = error.response?.status;
    const requestUrl = originalRequest?.url || "";
    const isRefreshCall = requestUrl.includes("/api/v1/auth/refreshtoken");

    // Don't try to refresh if the refresh request itself failed.
    if (status === 401 && isRefreshCall) {
      return Promise.reject(error);
    }

    if (status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        if (!refreshPromise) {
          refreshPromise = api
            .post("/api/v1/auth/refreshtoken")
            .then(() => true)
            .catch(() => false)
            .finally(() => {
              refreshPromise = null;
            });
        }

        const refreshed = await refreshPromise;
        if (!refreshed) return Promise.reject(error);

        return api(originalRequest);
      } catch (refreshError) {
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  },
);

export default api;
