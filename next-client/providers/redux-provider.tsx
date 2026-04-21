"use client";

import { setupListeners } from "@reduxjs/toolkit/query";
import { useEffect, useRef, type ReactNode } from "react";
import { Provider } from "react-redux";
import { store } from "@/store";

export default function ReduxProvider({ children }: { children: ReactNode }) {
  const listenersReady = useRef(false);

  useEffect(() => {
    if (listenersReady.current) return;

    listenersReady.current = true;

    const unsubscribe = setupListeners(store.dispatch);

    return unsubscribe;
  }, []);

  return <Provider store={store}>{children}</Provider>;
}
