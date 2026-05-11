import { fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { userLoggedOut } from "../authSlice";
import { prepareAuthHeaders } from "./prepareAuthHeaders";

const normalizeLocalBaseUrl = (baseUrl) => {
  if (typeof baseUrl !== "string") {
    return baseUrl;
  }

  if (!baseUrl.startsWith("http://localhost:")) {
    return baseUrl;
  }

  return baseUrl.replace("http://localhost:", "http://[::1]:");
};

const getRequestMeta = (args) => {
  if (typeof args === "string") {
    return {
      url: args,
      method: "GET",
    };
  }

  return {
    url: args?.url || "",
    method: String(args?.method || "GET").toUpperCase(),
  };
};

export const createAuthBaseQuery = (baseUrl) => {
  const normalizedBaseUrl = normalizeLocalBaseUrl(baseUrl);
  const rawBaseQuery = fetchBaseQuery({
    baseUrl: normalizedBaseUrl,
    credentials: "include",
    prepareHeaders: prepareAuthHeaders,
  });

  return async (args, api, extraOptions) => {
    let result = await rawBaseQuery(args, api, extraOptions);

    const { url, method } = getRequestMeta(args);
    const shouldRetryMissingProgress =
      result.error?.status === 404 &&
      typeof normalizedBaseUrl === "string" &&
      normalizedBaseUrl.includes("/progress") &&
      method === "GET" &&
      /^\/course\/[^/]+$/.test(url);

    if (shouldRetryMissingProgress) {
      await rawBaseQuery(
        {
          url: `${url}/initialize`,
          method: "POST",
        },
        api,
        extraOptions
      );

      result = await rawBaseQuery(args, api, extraOptions);
    }

    if (result.error?.status === 401) {
      localStorage.removeItem("token");
      api.dispatch(userLoggedOut());
    }

    return result;
  };
};