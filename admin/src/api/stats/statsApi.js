import { createApi } from "@reduxjs/toolkit/query/react";

import api from "../api";

export const statsApi = createApi({
  reducerPath: "statsApi",
  baseQuery: api,
  endpoints: (builder) => ({
    getDashboardStats: builder.query({
      query: () => ({
        url: "/api/v1/stats/dashboard",
        method: "GET",
      }),
      transformResponse: (response) => response?.data ?? null,
    }),
  }),
});

export const { useGetDashboardStatsQuery } = statsApi;
