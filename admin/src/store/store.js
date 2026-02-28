import { configureStore } from "@reduxjs/toolkit";

import { authApi } from "./auth/authApi";
import { categoryApi } from "./category/categoryApi";

export const store = configureStore({
  reducer: {
    [authApi.reducerPath]: authApi.reducer,
    [categoryApi.reducerPath]: categoryApi.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(authApi.middleware, categoryApi.middleware),
});

export default store;
