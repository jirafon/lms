import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useGetInstructorMetricsQuery } from "@/features/api/instructorApi";
import React from "react";
import { useTranslation } from "react-i18next";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

const InstructorDashboard = () => {
  const { t } = useTranslation();
  const { data, isLoading, isError, error } = useGetInstructorMetricsQuery();

  if (isLoading) return <h1>{t("common.loading")}</h1>;
  if (isError || !data) {
    console.error("Failed to load instructor metrics", error);
    if (error?.status === 'PARSING_ERROR') {
      console.error("Unexpected response format:", error);
    }
    return (
      <div className="text-center">
        <h1 className="text-red-500">Failed to load instructor metrics</h1>
        <p className="text-gray-500">{error?.data?.message || "An unexpected error occurred."}</p>
      </div>
    );
  }

  const {
    totalCourses = 0,
    totalStudents = 0,
    totalRevenue = 0,
    coursePerformance = [],
  } = data;

  return (
    <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
      <Card className="shadow-lg hover:shadow-xl transition-shadow duration-300">
        <CardHeader>
          <CardTitle>Total Courses</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-3xl font-bold text-blue-600">{totalCourses}</p>
        </CardContent>
      </Card>

      <Card className="shadow-lg hover:shadow-xl transition-shadow duration-300">
        <CardHeader>
          <CardTitle>Total Students</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-3xl font-bold text-blue-600">{totalStudents}</p>
        </CardContent>
      </Card>

      <Card className="shadow-lg hover:shadow-xl transition-shadow duration-300">
        <CardHeader>
          <CardTitle>Total Revenue</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-3xl font-bold text-blue-600">${totalRevenue}</p>
        </CardContent>
      </Card>

      <Card className="shadow-lg hover:shadow-xl transition-shadow duration-300 col-span-1 sm:col-span-2 md:col-span-3 lg:col-span-4">
        <CardHeader>
          <CardTitle className="text-xl font-semibold text-gray-700">
            Course Performance
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={coursePerformance} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="courseTitle" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="revenue" fill="#8884d8" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
};

export default InstructorDashboard;
