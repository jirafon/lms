import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

export const instructorApi = createApi({
  reducerPath: 'instructorApi',
  baseQuery: fetchBaseQuery({
    baseUrl: '/api',
    prepareHeaders: (headers) => {
      const token = localStorage.getItem('token'); // Retrieve token from localStorage
      if (!token) {
        console.warn('Token is missing. Ensure the user is logged in.');
      } else {
        headers.set('Authorization', `Bearer ${token}`);
      }
      return headers;
    },
  }),
  endpoints: (builder) => ({
    getInstructorMetrics: builder.query({
      query: () => 'instructor/metrics',
    }),
  }),
});

export const { useGetInstructorMetricsQuery } = instructorApi;