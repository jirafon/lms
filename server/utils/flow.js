import crypto from "crypto";

const FLOW_SANDBOX_URL = "https://sandbox.flow.cl/api";
const FLOW_PRODUCTION_URL = "https://www.flow.cl/api";

const trimTrailingSlash = (value = "") => value.replace(/\/+$/, "");

const getFlowBaseUrl = () => {
  if (process.env.FLOW_API_BASE_URL || process.env.FLOW_BASE_URL) {
    return trimTrailingSlash(process.env.FLOW_API_BASE_URL || process.env.FLOW_BASE_URL);
  }

  return process.env.FLOW_ENV === "production" ? FLOW_PRODUCTION_URL : FLOW_SANDBOX_URL;
};

const normalizeFlowValue = (value) => {
  if (value === undefined || value === null) {
    return "";
  }

  if (typeof value === "object") {
    return JSON.stringify(value);
  }

  return String(value);
};

export const isFlowConfigured = () => {
  return Boolean(process.env.FLOW_API_KEY && process.env.FLOW_SECRET_KEY);
};

export const signFlowParams = (params) => {
  const entries = Object.entries(params)
    .filter(([key, value]) => key !== "s" && value !== undefined && value !== null && value !== "")
    .sort(([firstKey], [secondKey]) => firstKey.localeCompare(secondKey));

  const payload = entries
    .map(([key, value]) => `${key}${normalizeFlowValue(value)}`)
    .join("");

  return crypto
    .createHmac("sha256", process.env.FLOW_SECRET_KEY)
    .update(payload)
    .digest("hex");
};

const parseFlowResponse = async (response) => {
  const contentType = response.headers.get("content-type") || "";

  if (contentType.includes("application/json")) {
    return response.json();
  }

  const text = await response.text();

  try {
    return JSON.parse(text);
  } catch {
    return { message: text };
  }
};

const flowRequest = async (path, params, method = "GET") => {
  if (!isFlowConfigured()) {
    throw new Error("Flow credentials are not configured.");
  }

  const signedParams = {
    ...params,
    apiKey: process.env.FLOW_API_KEY,
  };

  const signature = signFlowParams(signedParams);
  const finalParams = {
    ...signedParams,
    s: signature,
  };

  const url = new URL(`${getFlowBaseUrl()}${path}`);
  const requestOptions = { method };

  if (method === "GET") {
    Object.entries(finalParams).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== "") {
        url.searchParams.set(key, normalizeFlowValue(value));
      }
    });
  } else {
    const body = new URLSearchParams();

    Object.entries(finalParams).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== "") {
        body.set(key, normalizeFlowValue(value));
      }
    });

    requestOptions.headers = {
      "Content-Type": "application/x-www-form-urlencoded",
    };
    requestOptions.body = body.toString();
  }

  const response = await fetch(url, requestOptions);
  const data = await parseFlowResponse(response);

  if (!response.ok) {
    throw new Error(data?.message || "Flow request failed.");
  }

  return data;
};

export const createFlowPayment = async (params) => {
  return flowRequest("/payment/create", params, "POST");
};

export const getFlowPaymentStatus = async (token) => {
  return flowRequest("/payment/getStatus", { token }, "GET");
};

export const getConfiguredFlowCurrency = (fallbackCurrency) => {
  return process.env.FLOW_CURRENCY || fallbackCurrency || "CLP";
};
