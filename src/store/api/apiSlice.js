import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export const apiSlice = createApi({
  reducerPath: "api",
  baseQuery: fetchBaseQuery({
    baseUrl: "/api",
    // Add error handling to prevent automatic error toasts
    validateStatus: (response, body) => {
      // Don't treat 401/403 as errors for automatic handling
      if (response.status === 401 || response.status === 403) {
        return true; // Don't throw error
      }
      return response.status >= 200 && response.status < 300;
    },
  }),
  endpoints: (builder) => ({}),
});
