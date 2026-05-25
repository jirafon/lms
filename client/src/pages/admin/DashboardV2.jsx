import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  useGetCreatorCourseQuery,
  useGetStudentsDashboardQuery,
} from "@/features/api/courseApi";
import {
  BookOpen,
  Building2,
  GraduationCap,
  Layers,
  Users,
} from "lucide-react";
import React, { useMemo } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

const DashboardV2 = () => {
  const {
    data: creatorCoursesData,
    isLoading: coursesLoading,
    isError: coursesError,
  } = useGetCreatorCourseQuery();

  const {
    data: studentsDashboardData,
    isLoading: studentsLoading,
    isError: studentsError,
  } = useGetStudentsDashboardQuery("");

  const courses = creatorCoursesData?.courses || [];
  const students = studentsDashboardData?.students || [];
  const summary = studentsDashboardData?.summary || {};

  const metrics = useMemo(() => {
    const totalCourses = courses.length;
    const publishedCourses = courses.filter((course) => Boolean(course?.isPublished)).length;
    const draftCourses = totalCourses - publishedCourses;
    const quoteOnlyCourses = courses.filter((course) => Boolean(course?.quoteOnly)).length;

    const enrollmentsByCourse = new Map();
    let totalEnrollments = 0;

    for (const student of students) {
      const enrolledCourses = Array.isArray(student?.enrolledCourses)
        ? student.enrolledCourses
        : [];

      totalEnrollments += enrolledCourses.length;

      for (const enrolledCourse of enrolledCourses) {
        const courseId = enrolledCourse?.id || enrolledCourse?._id || enrolledCourse?.courseId;
        const courseTitle = enrolledCourse?.title || enrolledCourse?.courseTitle || "Curso sin nombre";

        if (!courseId) {
          continue;
        }

        const current = enrollmentsByCourse.get(courseId) || {
          courseId,
          courseTitle,
          enrollments: 0,
        };

        current.enrollments += 1;
        enrollmentsByCourse.set(courseId, current);
      }
    }

    const topCourses = Array.from(enrollmentsByCourse.values())
      .sort((a, b) => b.enrollments - a.enrollments)
      .slice(0, 5);

    return {
      totalCourses,
      publishedCourses,
      draftCourses,
      quoteOnlyCourses,
      totalStudents: summary?.totalStudents || students.length,
      totalContracts: summary?.totalContracts || 0,
      totalEnrollments: summary?.totalEnrollments || totalEnrollments,
      topCourses,
    };
  }, [courses, students, summary]);

  const courseStatusChartData = useMemo(
    () => [
      { name: "Publicados", value: metrics.publishedCourses, color: "#059669" },
      { name: "Borradores", value: metrics.draftCourses, color: "#64748b" },
      { name: "Quote Only", value: metrics.quoteOnlyCourses, color: "#d97706" },
    ],
    [metrics.publishedCourses, metrics.draftCourses, metrics.quoteOnlyCourses]
  );

  const topCoursesChartData = useMemo(
    () => metrics.topCourses.map((item) => ({
      name: item.courseTitle,
      alumnos: item.enrollments,
    })),
    [metrics.topCourses]
  );

  if (coursesLoading || studentsLoading) {
    return <h1>Cargando dashboard de KPIs...</h1>;
  }

  if (coursesError || studentsError) {
    return (
      <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-red-600">
        No fue posible cargar el dashboard nuevo. Intenta nuevamente.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-slate-900">Dashboard KPI v2</h1>
        <p className="mt-1 text-sm text-slate-500">
          Vista nueva de cursos y alumnos en una pagina separada del dashboard antiguo.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-slate-600">Total Cursos</CardTitle>
            <BookOpen className="h-4 w-4 text-slate-500" />
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-slate-900">{metrics.totalCourses}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-slate-600">Cursos Publicados</CardTitle>
            <Layers className="h-4 w-4 text-emerald-500" />
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-emerald-600">{metrics.publishedCourses}</p>
            <p className="text-xs text-slate-500">Borradores: {metrics.draftCourses}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-slate-600">Total Alumnos</CardTitle>
            <Users className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-blue-600">{metrics.totalStudents}</p>
            <p className="text-xs text-slate-500">Contratos: {metrics.totalContracts}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-slate-600">Inscripciones</CardTitle>
            <GraduationCap className="h-4 w-4 text-violet-500" />
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-violet-600">{metrics.totalEnrollments}</p>
            <p className="text-xs text-slate-500">Cursos grupales: {metrics.quoteOnlyCourses}</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Estado de Cursos</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={courseStatusChartData}
                    dataKey="value"
                    nameKey="name"
                    outerRadius={90}
                    innerRadius={54}
                  >
                    {courseStatusChartData.map((entry) => (
                      <Cell key={entry.name} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="mt-3 flex flex-wrap gap-2">
              {courseStatusChartData.map((item) => (
                <Badge key={item.name} variant="outline" className="gap-2 border-slate-200">
                  <span className="h-2 w-2 rounded-full" style={{ backgroundColor: item.color }} />
                  {item.name}: {item.value}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Top Cursos por Alumnos</CardTitle>
            <Building2 className="h-4 w-4 text-slate-500" />
          </CardHeader>
          <CardContent>
            {metrics.topCourses.length === 0 ? (
              <p className="text-sm text-slate-500">Sin datos de inscripciones para mostrar.</p>
            ) : (
              <div className="space-y-3">
                {metrics.topCourses.map((item, index) => (
                  <div
                    key={item.courseId}
                    className="flex items-center justify-between rounded-lg border border-slate-200 p-3"
                  >
                    <div>
                      <p className="text-sm font-medium text-slate-800">{index + 1}. {item.courseTitle}</p>
                    </div>
                    <Badge variant="secondary">{item.enrollments} alumnos</Badge>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Top 5 Cursos (alumnos inscritos)</CardTitle>
        </CardHeader>
        <CardContent>
          {topCoursesChartData.length === 0 ? (
            <p className="text-sm text-slate-500">Sin datos de inscripciones para graficar.</p>
          ) : (
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={topCoursesChartData} margin={{ top: 8, right: 12, left: 0, bottom: 8 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" interval={0} tick={{ fontSize: 11 }} />
                  <YAxis allowDecimals={false} />
                  <Tooltip />
                  <Bar dataKey="alumnos" fill="#2563eb" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default DashboardV2;