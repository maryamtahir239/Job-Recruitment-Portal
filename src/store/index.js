import { configureStore } from "@reduxjs/toolkit";
import rootReducer from "./rootReducer";
import { apiSlice } from "./api/apiSlice";
const store = configureStore({
  reducer: {
    ...rootReducer,
    [apiSlice.reducerPath]: apiSlice.reducer,
  },
  devTools: false,
  // reducer: rootReducer,
  middleware: (getDefaultMiddleware) => {
    // Temporarily disable API slice middleware to fix the issue
    // const middleware = [...getDefaultMiddleware(), apiSlice.middleware];
    const middleware = [...getDefaultMiddleware()];
    return middleware;
  },
});

export default store;
