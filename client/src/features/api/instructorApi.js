import { createApi } from '@reduxjs/toolkit/query/react';
import { createAuthBaseQuery } from './createAuthBaseQuery';

export const instructorApi = createApi({
  reducerPath: 'instructorApi',
  baseQuery: createAuthBaseQuery('/api'),
  endpoints: (builder) => ({
    getInstructorMetrics: builder.query({
      query: () => 'instructor/metrics',
    }),
  }),
});

export const { useGetInstructorMetricsQuery } = instructorApi;