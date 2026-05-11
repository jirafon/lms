import { createApi } from "@reduxjs/toolkit/query/react";
import { createAuthBaseQuery } from "./createAuthBaseQuery";

//const COURSE_PURCHASE_API = "http://localhost:3010/api/v1/purchase";

const COURSE_PURCHASE_API = process.env.REACT_APP_API_BASE_URL 
  ? process.env.REACT_APP_API_BASE_URL + "/purchase"
  : "http://localhost:3010/api/v1/purchase";

export const purchaseApi = createApi({
  reducerPath: "purchaseApi",
  baseQuery: createAuthBaseQuery(COURSE_PURCHASE_API),
  endpoints: (builder) => ({
    createCheckoutSession: builder.mutation({
      query: (courseId) => ({
        url: "/checkout/create-checkout-session",
        method: "POST",
        body: { courseId },
      }),
    }),
    getCourseDetailWithStatus: builder.query({
      query: (courseId) => ({
        url: `/course/${courseId}/detail-with-status`,
        method: "GET",
      }),
    }),
    getPurchasedCourses: builder.query({
      query: () => ({
        url: `/`,
        method: "GET",
      }),
    }),
  }),
});

export const {
  useCreateCheckoutSessionMutation,
  useGetCourseDetailWithStatusQuery,
  useGetPurchasedCoursesQuery,
} = purchaseApi;
