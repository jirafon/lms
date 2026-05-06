import { fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { userLoggedOut } from "../authSlice";
import { prepareAuthHeaders } from "./prepareAuthHeaders";

export const createAuthBaseQuery = (baseUrl) => {
  const rawBaseQuery = fetchBaseQuery({
    baseUrl,
    credentials: "include",
    prepareHeaders: prepareAuthHeaders,
  });

  return async (args, api, extraOptions) => {
    const result = await rawBaseQuery(args, api, extraOptions);

    if (result.error?.status === 401) {
      localStorage.removeItem("token");
      api.dispatch(userLoggedOut());
    }

    return result;
  };
};