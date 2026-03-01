import { configureStore } from "@reduxjs/toolkit";
import { categoryApi } from "../api/category/categoryApi";
import { authApi } from "../api/auth/authApi";
import { productApi } from "../api/product/productApi";

export const store = configureStore({
  reducer: {
    [authApi.reducerPath]: authApi.reducer,
    [categoryApi.reducerPath]: categoryApi.reducer,
    [productApi.reducerPath]: productApi.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(
      authApi.middleware,
      categoryApi.middleware,
      productApi.middleware,
    ),
});

export default store;
