import { configureStore } from "@reduxjs/toolkit";
import { authApi } from "./services/auth";
import { llmApi } from "./services/lmm";
import authReducer from "./store/authSlice";

export const store = configureStore({
  reducer: {
    auth: authReducer,
    [authApi.reducerPath]: authApi.reducer,
    [llmApi.reducerPath]: llmApi.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(authApi.middleware, llmApi.middleware),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
