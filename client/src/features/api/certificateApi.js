import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

const CERTIFICATE_API = import.meta.env.VITE_API_BASE_URL + "/certificate/";

export const certificateApi = createApi({
  reducerPath: "certificateApi",
  tagTypes: ["Certificate"],
  baseQuery: fetchBaseQuery({
    baseUrl: CERTIFICATE_API,
    credentials: "include",
  }),
  endpoints: (builder) => ({
    // Get user certificates
    getUserCertificates: builder.query({
      query: () => ({
        url: "user",
        method: "GET",
      }),
      providesTags: ["Certificate"],
    }),

    // Download certificate for a course
    downloadCertificate: builder.query({
      query: (courseId) => ({
        url: `course/${courseId}/download`,
        method: "GET",
        responseHandler: async (response) => {
          const blob = await response.blob();
          const url = window.URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = `certificado_curso_${courseId}.pdf`;
          document.body.appendChild(a);
          a.click();
          window.URL.revokeObjectURL(url);
          document.body.removeChild(a);
          return { success: true };
        },
      }),
    }),
  }),
});

export const {
  useGetUserCertificatesQuery,
  useLazyDownloadCertificateQuery,
} = certificateApi; 