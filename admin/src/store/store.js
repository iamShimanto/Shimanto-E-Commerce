import { configureStore } from "@reduxjs/toolkit";
import { categoryApi } from "../api/category/categoryApi";
import { authApi } from "../api/auth/authApi";
import { productApi } from "../api/product/productApi";
import { backupApi } from "../api/backup/backupApi";
import { subscriptionApi } from "../api/subscription/subscriptionApi";
import { cartApi } from "../api/cart/cartApi";
import { orderApi } from "../api/order/orderApi";
import { statsApi } from "../api/stats/statsApi";

export const store = configureStore({
  reducer: {
    [authApi.reducerPath]: authApi.reducer,
    [categoryApi.reducerPath]: categoryApi.reducer,
    [productApi.reducerPath]: productApi.reducer,
    [backupApi.reducerPath]: backupApi.reducer,
    [subscriptionApi.reducerPath]: subscriptionApi.reducer,
    [cartApi.reducerPath]: cartApi.reducer,
    [orderApi.reducerPath]: orderApi.reducer,
    [statsApi.reducerPath]: statsApi.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(
      authApi.middleware,
      categoryApi.middleware,
      productApi.middleware,
      backupApi.middleware,
      subscriptionApi.middleware,
      cartApi.middleware,
      orderApi.middleware,
      statsApi.middleware,
    ),
});

export default store;
