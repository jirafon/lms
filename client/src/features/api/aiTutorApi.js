import { createApi } from "@reduxjs/toolkit/query/react";
import { createAuthBaseQuery } from "./createAuthBaseQuery";

const AI_TUTOR_API = process.env.REACT_APP_API_BASE_URL
  ? process.env.REACT_APP_API_BASE_URL + "/ai-tutor"
  : "http://localhost:3010/api/v1/ai-tutor";

export const aiTutorApi = createApi({
  reducerPath: "aiTutorApi",
  tagTypes: ["AITutor"],
  baseQuery: createAuthBaseQuery(AI_TUTOR_API),
  endpoints: (builder) => ({
    getTutorHistory: builder.query({
      query: ({ courseId, lectureId }) => ({
        url: `course/${courseId}/lecture/${lectureId}/history`,
        method: "GET",
      }),
      providesTags: (_result, _error, { courseId, lectureId }) => [{ type: "AITutor", id: `${courseId}-${lectureId}` }],
    }),
    chatWithTutor: builder.mutation({
      query: ({ courseId, ...body }) => ({
        url: `course/${courseId}/chat`,
        method: "POST",
        body,
      }),
      invalidatesTags: (_result, _error, { courseId, lectureId }) => [{ type: "AITutor", id: `${courseId}-${lectureId}` }],
    }),
    clearTutorHistory: builder.mutation({
      query: ({ courseId, lectureId }) => ({
        url: `course/${courseId}/lecture/${lectureId}/history`,
        method: "DELETE",
      }),
      invalidatesTags: (_result, _error, { courseId, lectureId }) => [{ type: "AITutor", id: `${courseId}-${lectureId}` }],
    }),
  }),
});

export const { useGetTutorHistoryQuery, useChatWithTutorMutation, useClearTutorHistoryMutation } = aiTutorApi;