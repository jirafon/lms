import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { prepareAuthHeaders } from './prepareAuthHeaders';

export const instructorApi = createApi({
  reducerPath: 'instructorApi',
  baseQuery: fetchBaseQuery({
    baseUrl: '/api',
    prepareHeaders: prepareAuthHeaders,
  }),
  endpoints: (builder) => ({
    getInstructorMetrics: builder.query({
      query: () => 'instructor/metrics',
    }),
  }),
});

export const { useGetInstructorMetricsQuery } = instructorApi;