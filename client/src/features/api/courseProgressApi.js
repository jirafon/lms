import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
// Opción 1: importar y luego llamar a .config()

///const COURSE_PROGRESS_API = "http://localhost:3010/api/v1/progress";
const COURSE_PROGRESS_API = import.meta.env.VITE_API_BASE_URL 
  ? import.meta.env.VITE_API_BASE_URL + "/progress"
  : "http://localhost:3010/api/v1/progress";

export const courseProgressApi = createApi({
  reducerPath: "courseProgressApi",
  tagTypes: ["CourseProgress"],
  baseQuery: fetchBaseQuery({
    baseUrl: COURSE_PROGRESS_API,
    credentials: "include",
  }),
  endpoints: (builder) => ({
    getCourseProgress: builder.query({
      query: (courseId) => ({
        url: `/course/${courseId}`,
        method: "GET",
      }),
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
    completeCourse: builder.mutation({
        query:(courseId) => ({
            url:`/${courseId}/complete`,
            method:"POST"
        }),
        invalidatesTags: ["CourseProgress"],
    }),
    inCompleteCourse: builder.mutation({
        query:(courseId) => ({
            url:`/${courseId}/incomplete`,
            method:"POST"
        }),
        invalidatesTags: ["CourseProgress"],
    }),
  }),
});
export const {
useGetCourseProgressQuery,
useUpdateLectureProgressMutation,
useUpdateQuizProgressMutation,
useCheckLectureAccessQuery,
useCompleteCourseMutation,
useInCompleteCourseMutation
} = courseProgressApi;
