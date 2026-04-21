import {
	createApi,
	fetchBaseQuery,
} from "@reduxjs/toolkit/query/react";
import type {
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

let refreshTokenRequest: Promise<boolean> | null = null;

const baseQueryWithReauth: BaseQueryFn<
	string | FetchArgs,
	unknown,
	FetchBaseQueryError
> = async (args, api, extraOptions) => {
	const endpoint = typeof args === "string" ? args : args.url;
	let result = await rawBaseQuery(args, api, extraOptions);

	if (result.error?.status === 401 && !endpoint.includes("/auth/refreshtoken")) {
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

				return !refreshResult.error;
			})().finally(() => {
				refreshTokenRequest = null;
			});
		}

		const refreshed = await refreshTokenRequest;

		if (refreshed) {
			result = await rawBaseQuery(args, api, extraOptions);
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
