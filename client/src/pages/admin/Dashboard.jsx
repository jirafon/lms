import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useGetInstructorMetricsQuery } from "@/features/api/instructorApi";
import React from "react";
import { useTranslation } from "react-i18next";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { Bot, MessageSquareText, Sparkles, Users } from "lucide-react";

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
    tutorMetrics = {},
  } = data.metrics || {};

  const {
    totalConversations = 0,
    totalLearnersUsingTutor = 0,
    totalPromptMessages = 0,
    averageMessagesPerConversation = 0,
    interactionBreakdown = {},
    topTutorCourses = [],
  } = tutorMetrics;

  const interactionCards = [
    { key: 'freeform', label: 'Preguntas libres' },
    { key: 'summary', label: 'Resúmenes' },
    { key: 'example', label: 'Ejemplos' },
    { key: 'practice', label: 'Práctica' },
    { key: 'review', label: 'Repaso' },
    { key: 'quiz_errors', label: 'Errores de quiz' },
    { key: 'retry_prep', label: 'Preparación de reintento' },
  ];

  const revenueLabel = new Intl.NumberFormat("es-CL", {
    style: "currency",
    currency: "CLP",
    maximumFractionDigits: 0,
  }).format(totalRevenue || 0);

  return (
    <div className="space-y-6">
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
            <p className="text-3xl font-bold text-blue-600">{revenueLabel}</p>
          </CardContent>
        </Card>

        <Card className="shadow-lg hover:shadow-xl transition-shadow duration-300">
          <CardHeader>
            <CardTitle>AI Tutor Prompts</CardTitle>
          </CardHeader>
          <CardContent className="flex items-center justify-between gap-3">
            <div>
              <p className="text-3xl font-bold text-sky-600">{totalPromptMessages}</p>
              <p className="text-sm text-slate-500">Mensajes iniciados por alumnos</p>
            </div>
            <MessageSquareText className="h-8 w-8 text-sky-500" />
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 grid-cols-1 lg:grid-cols-3">
        <Card className="shadow-lg hover:shadow-xl transition-shadow duration-300">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bot className="h-5 w-5 text-sky-500" />
              Conversaciones tutor
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-slate-900">{totalConversations}</p>
            <p className="mt-2 text-sm text-slate-500">Sesiones guardadas por curso y lección.</p>
          </CardContent>
        </Card>

        <Card className="shadow-lg hover:shadow-xl transition-shadow duration-300">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5 text-emerald-500" />
              Learners usando tutor
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-slate-900">{totalLearnersUsingTutor}</p>
            <p className="mt-2 text-sm text-slate-500">Alumnos únicos que ya interactuaron con el tutor.</p>
          </CardContent>
        </Card>

        <Card className="shadow-lg hover:shadow-xl transition-shadow duration-300">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-amber-500" />
              Promedio por conversación
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-slate-900">{averageMessagesPerConversation}</p>
            <p className="mt-2 text-sm text-slate-500">Mensajes totales intercambiados por sesión del tutor.</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 grid-cols-1 lg:grid-cols-2">
        <Card className="shadow-lg hover:shadow-xl transition-shadow duration-300 col-span-1">
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

        <Card className="shadow-lg hover:shadow-xl transition-shadow duration-300 col-span-1">
          <CardHeader>
            <CardTitle className="text-xl font-semibold text-gray-700">
              Cursos con mayor uso del tutor
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {topTutorCourses.length === 0 ? (
                <p className="text-sm text-slate-500">Todavía no hay uso del tutor en tus cursos.</p>
              ) : (
                topTutorCourses.map((course) => (
                  <div key={course.courseTitle} className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <p className="font-semibold text-slate-900">{course.courseTitle}</p>
                        <p className="mt-1 text-sm text-slate-500">{course.learners} alumnos usaron el tutor</p>
                      </div>
                      <div className="text-right text-sm text-slate-600">
                        <p>{course.prompts} prompts</p>
                        <p>{course.conversations} conversaciones</p>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="shadow-lg hover:shadow-xl transition-shadow duration-300">
        <CardHeader>
          <CardTitle className="text-xl font-semibold text-gray-700">
            Tipos de interacción con el tutor
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3 grid-cols-1 md:grid-cols-2 xl:grid-cols-4">
            {interactionCards.map((item) => (
              <div key={item.key} className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                <p className="text-sm text-slate-500">{item.label}</p>
                <p className="mt-2 text-2xl font-semibold text-slate-900">{interactionBreakdown[item.key] || 0}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default InstructorDashboard;
