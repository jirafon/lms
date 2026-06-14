import { createApi } from "@reduxjs/toolkit/query/react";
import { createAuthBaseQuery } from "./createAuthBaseQuery";

const COURSE_API = process.env.REACT_APP_API_BASE_URL 
  ? process.env.REACT_APP_API_BASE_URL + "/course"
  : "http://localhost:3010/api/v1/course";

export const courseApi = createApi({
  reducerPath: "courseApi",
  tagTypes: ["Refetch_Creator_Course", "Refetch_Lecture", "Refetch_Students"],
  baseQuery: createAuthBaseQuery(COURSE_API),
  endpoints: (builder) => ({
    createCourse: builder.mutation({
      query: ({ courseTitle, category }) => ({
        url: "/create",
        method: "POST",
        body: { courseTitle, category },
      }),
      invalidatesTags: ["Refetch_Creator_Course"],
    }),
    getSearchCourse:builder.query({
      query: ({searchQuery, categories, sortByPrice}) => {
        const params = new URLSearchParams();
        params.set("query", searchQuery || "");

        if (categories && categories.length > 0) {
          categories.forEach((category) => params.append("categories", category));
        }

        if (sortByPrice) {
          params.set("sortByPrice", sortByPrice);
        }

        return {
          url:`/search?${params.toString()}`,
          method:"GET", 
        }
      }
    }),
    getPublishedCourse: builder.query({
      query: () => ({
        url: "/published",
        method: "GET",
      }),
    }),
    getCreatorCourse: builder.query({
      query: () => ({
        url: "/creator",
        method: "GET",
      }),
      providesTags: ["Refetch_Creator_Course"],
      refetchOnMountOrArgChange: true,
    }),
    getCourseStudents: builder.query({
      query: (courseId) => ({
        url: `/${courseId}/students`,
        method: "GET",
      }),
      providesTags: ["Refetch_Students"],
    }),
    getStudentsDashboard: builder.query({
      query: (idcontrato = "") => ({
        url: `/students/dashboard${idcontrato ? `?idcontrato=${encodeURIComponent(idcontrato)}` : ""}`,
        method: "GET",
      }),
      providesTags: ["Refetch_Students"],
    }),
    enrollStudentByEmail: builder.mutation({
      query: ({ email, courseId }) => ({
        url: "/students/enroll",
        method: "POST",
        body: { email, courseId },
      }),
      invalidatesTags: ["Refetch_Students"],
    }),
    unenrollStudentFromCourse: builder.mutation({
      query: ({ studentId, courseId }) => ({
        url: "/students/unenroll",
        method: "POST",
        body: { studentId, courseId },
      }),
      invalidatesTags: ["Refetch_Students"],
    }),
    removeStudentFromDashboard: builder.mutation({
      query: ({ studentId }) => ({
        url: "/students/remove",
        method: "POST",
        body: { studentId },
      }),
      invalidatesTags: ["Refetch_Students"],
    }),
    editCourse: builder.mutation({
      query: ({ formData, courseId }) => ({
        url: `/${courseId}`,
        method: "PUT",
        body: formData,
      }),
      invalidatesTags: ["Refetch_Creator_Course"],
    }),
    getCourseById: builder.query({
      query: (courseId) => ({
        url: `/${courseId}`,
        method: "GET",
      }),
    }),
    createLecture: builder.mutation({
      query: ({ lectureTitle, lectureDescription, supportMaterials = [], courseId }) => ({
        url: `/${courseId}/lecture`,
        method: "POST",
        body: { lectureTitle, lectureDescription, supportMaterials },
      }),
      invalidatesTags: ["Refetch_Lecture"],
    }),
    getCourseLecture: builder.query({
      query: (courseId) => ({
        url: `/${courseId}/lecture`,
        method: "GET",
      }),
      providesTags: ["Refetch_Lecture"],
    }),
    editLecture: builder.mutation({
      query: ({
        lectureTitle,
        lectureDescription,
        lectureOrder,
        videoInfo,
        supportMaterials,
        isPreviewFree,
        courseId,
        lectureId,
      }) => ({
        url: `/${courseId}/lecture/${lectureId}`,
        method: "POST",
        body: { lectureTitle, lectureDescription, lectureOrder, videoInfo, supportMaterials, isPreviewFree },
      }),
      invalidatesTags: ["Refetch_Lecture"],
    }),
    reorderLecture: builder.mutation({
      query: ({ courseId, lectureId, direction }) => ({
        url: `/${courseId}/lecture/${lectureId}/reorder`,
        method: "PUT",
        body: { direction },
      }),
      invalidatesTags: ["Refetch_Lecture"],
    }),
    removeLecture: builder.mutation({
      query: (lectureId) => ({
        url: `/lecture/${lectureId}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Refetch_Lecture"],
    }),
    getLectureById: builder.query({
      query: (lectureId) => ({
        url: `/lecture/${lectureId}`,
        method: "GET",
      }),
      providesTags: ["Refetch_Lecture"],
    }),
    publishCourse: builder.mutation({
      query: ({ courseId, query }) => ({
        url: `/${courseId}/publish?publish=${query}`,
        method: "PUT",
      }),
    }),
    removeCourse: builder.mutation({
      query: (courseId) => ({
        url: `/${courseId}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Refetch_Creator_Course"],
    }),
  }),
});
export const {
  useCreateCourseMutation,
  useGetSearchCourseQuery,
  useGetPublishedCourseQuery,
  useGetCreatorCourseQuery,
  useLazyGetCourseStudentsQuery,
  useEditCourseMutation,
  useGetStudentsDashboardQuery,
  useEnrollStudentByEmailMutation,
  useUnenrollStudentFromCourseMutation,
  useRemoveStudentFromDashboardMutation,
  useGetCourseByIdQuery,
  useCreateLectureMutation,
  useGetCourseLectureQuery,
  useEditLectureMutation,
  useReorderLectureMutation,
  useRemoveLectureMutation,
  useGetLectureByIdQuery,
  usePublishCourseMutation,
  useRemoveCourseMutation,
} = courseApi;
