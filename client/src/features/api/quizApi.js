import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

const QUIZ_API = import.meta.env.VITE_API_BASE_URL 
  ? import.meta.env.VITE_API_BASE_URL + "/quiz"
  : "http://localhost:3010/api/v1/quiz";

export const quizApi = createApi({
  reducerPath: "quizApi",
  tagTypes: ["Quiz", "QuizAttempt"],
  baseQuery: fetchBaseQuery({
    baseUrl: QUIZ_API,
    credentials: "include",
  }),
  endpoints: (builder) => ({
    // Create quiz for a course
    createQuiz: builder.mutation({
      query: ({ courseId, quizData }) => ({
        url: `course/${courseId}`,
        method: "POST",
        body: quizData,
      }),
      invalidatesTags: ["Quiz"],
    }),

    // Get quiz by ID (for instructors with answers, for students without)
    getQuizById: builder.query({
      query: (quizId) => ({
        url: `${quizId}`,
        method: "GET",
      }),
      providesTags: ["Quiz"],
    }),

    // Get quiz for a specific lecture
    getQuizByLecture: builder.query({
      query: (lectureId) => ({
        url: `lecture/${lectureId}`,
        method: "GET",
      }),
      providesTags: ["Quiz"],
    }),

    // Start a quiz attempt
    startQuiz: builder.mutation({
      query: (quizId) => ({
        url: `${quizId}/start`,
        method: "POST",
      }),
      invalidatesTags: ["QuizAttempt"],
    }),

    // Submit quiz answers
    submitQuiz: builder.mutation({
      query: ({ attemptId, answers }) => ({
        url: `attempt/${attemptId}/submit`,
        method: "POST",
        body: { answers },
      }),
      invalidatesTags: ["QuizAttempt"],
    }),

    // Get quiz results
    getQuizResults: builder.query({
      query: (attemptId) => ({
        url: `attempt/${attemptId}/results`,
        method: "GET",
      }),
      providesTags: ["QuizAttempt"],
    }),

    // Get student's quiz history for a course
    getStudentQuizHistory: builder.query({
      query: (courseId) => ({
        url: `course/${courseId}/history`,
        method: "GET",
      }),
      providesTags: ["QuizAttempt"],
    }),

    // Update quiz
    updateQuiz: builder.mutation({
      query: ({ quizId, updateData }) => ({
        url: `${quizId}`,
        method: "PUT",
        body: updateData,
      }),
      invalidatesTags: ["Quiz"],
    }),

    // Delete quiz
    deleteQuiz: builder.mutation({
      query: (quizId) => ({
        url: `${quizId}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Quiz"],
    }),
  }),
});

export const {
  useCreateQuizMutation,
  useGetQuizByIdQuery,
  useGetQuizByLectureQuery,
  useStartQuizMutation,
  useSubmitQuizMutation,
  useGetQuizResultsQuery,
  useGetStudentQuizHistoryQuery,
  useUpdateQuizMutation,
  useDeleteQuizMutation,
} = quizApi; 