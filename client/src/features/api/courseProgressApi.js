import { createApi } from "@reduxjs/toolkit/query/react";
import { createAuthBaseQuery } from "./createAuthBaseQuery";
// Opción 1: importar y luego llamar a .config()

///const COURSE_PROGRESS_API = "http://localhost:3010/api/v1/progress";
const COURSE_PROGRESS_API = process.env.REACT_APP_API_BASE_URL 
  ? process.env.REACT_APP_API_BASE_URL + "/progress"
  : "http://localhost:3010/api/v1/progress";

export const courseProgressApi = createApi({
  reducerPath: "courseProgressApi",
  tagTypes: ["CourseProgress"],
  baseQuery: createAuthBaseQuery(COURSE_PROGRESS_API),
  endpoints: (builder) => ({
    getUserProgress: builder.query({
      query: () => ({
        url: "/user",
        method: "GET",
      }),
      providesTags: ["CourseProgress"],
    }),
    getCourseProgress: builder.query({
      async queryFn(courseId, _api, _extraOptions, baseQuery) {
        const initializeResult = await baseQuery({
          url: `/course/${courseId}/initialize`,
          method: "POST",
        });

        if (initializeResult.error && initializeResult.error.status !== 200 && initializeResult.error.status !== 201) {
          return { error: initializeResult.error };
        }

        const progressResult = await baseQuery({
          url: `/course/${courseId}`,
          method: "GET",
        });

        if (progressResult.error) {
          return { error: progressResult.error };
        }

        return { data: progressResult.data };
      },
      providesTags: ["CourseProgress"],
    }),
    updateLectureProgress: builder.mutation({
      query: ({ courseId, lectureId }) => ({
        url: `/course/${courseId}/lecture/${lectureId}`,
        method: "PUT",
        body: { completed: true }
      }),
      invalidatesTags: ["CourseProgress"],
    }),
    // Add new mutation for updating quiz progress
    updateQuizProgress: builder.mutation({
      query: ({ courseId, lectureId, score, passed }) => ({
        url: `/course/${courseId}/lecture/${lectureId}/quiz`,
        method: "PUT", 
        body: { score, passed },
      }),
      invalidatesTags: ["CourseProgress"],
    }),
    // Add query to check lecture access
    checkLectureAccess: builder.query({
      query: ({ courseId, lectureId }) => ({
        url: `/course/${courseId}/lecture/${lectureId}/access`,
        method: "GET",
      }),
    }),
  }),
});
export const {
useGetUserProgressQuery,
useGetCourseProgressQuery,
useUpdateLectureProgressMutation,
useUpdateQuizProgressMutation,
useCheckLectureAccessQuery,
} = courseProgressApi;
