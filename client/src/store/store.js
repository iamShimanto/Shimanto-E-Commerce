import { configureStore } from "@reduxjs/toolkit";
import { categoryApi } from "../api/category/categoryApi";
import { authApi } from "../api/auth/authApi";
import { productsApi } from "../api/products/productsApi";
import { orderApi } from "../api/order/orderApi";
import { cartApi } from "../api/cart/cartApi";

export const store = configureStore({
  reducer: {
    [categoryApi.reducerPath]: categoryApi.reducer,
    [authApi.reducerPath]: authApi.reducer,
    [productsApi.reducerPath]: productsApi.reducer,
    [orderApi.reducerPath]: orderApi.reducer,
    [cartApi.reducerPath]: cartApi.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(
      categoryApi.middleware,
      authApi.middleware,
      productsApi.middleware,
      orderApi.middleware,
      cartApi.middleware,
    ),
});

export default store;
