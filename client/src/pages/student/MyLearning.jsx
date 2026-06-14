import React, { useMemo } from "react";
import Course from "./Course";
import { useLoadUserQuery } from "@/features/api/authApi";
import { useGetCreatorCourseQuery } from "@/features/api/courseApi";
import { useGetUserProgressQuery } from "@/features/api/courseProgressApi";
import { Skeleton } from "@/components/ui/skeleton";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import { ROUTES } from "@/utils/routes";
import { Button } from "@/components/ui/button";
import { isInstructor } from "@/utils/userRole";
import { enrichCourseForClient, resolveCourseThumbnail } from "@/utils/mediaUrl";
import Breadcrumbs from "@/components/Breadcrumbs";
import ContinueLearningCard from "@/components/ContinueLearningCard";
import { Award, BookOpen, GraduationCap } from "lucide-react";

const pickContinueCourse = ({ enrolledCourses, progressData, progressByCourseId }) => {
  const progressList = progressData?.progress || [];

  const inProgress = progressList
    .filter((entry) => (entry.progress ?? 0) < 100 && entry.courseId)
    .sort(
      (a, b) =>
        new Date(b.lastAccessedAt || 0).getTime() -
        new Date(a.lastAccessedAt || 0).getTime()
    );

  if (inProgress.length > 0) {
    const entry = inProgress[0];
    const courseId = String(entry.courseId?._id || entry.courseId);
    const enrolled = enrolledCourses.find((course) => String(course._id) === courseId);

    return {
      course:
        enrolled || {
          _id: courseId,
          courseTitle: entry.courseTitle,
          courseThumbnail: entry.courseThumbnail,
        },
      progressEntry: entry,
    };
  }

  const notStarted = enrolledCourses.find(
    (course) => !progressByCourseId.has(String(course._id))
  );

  if (notStarted) {
    return { course: notStarted, progressEntry: null };
  }

  if (enrolledCourses[0]) {
    return {
      course: enrolledCourses[0],
      progressEntry: progressByCourseId.get(String(enrolledCourses[0]._id)),
    };
  }

  return null;
};

const MyLearning = () => {
  const { t } = useTranslation();
  const { data, isLoading, error } = useLoadUserQuery();
  const { data: progressData } = useGetUserProgressQuery();
  const user = data?.user;
  const showCreatorCourses = isInstructor(user);
  const {
    data: creatorData,
    isLoading: creatorLoading,
    isError: creatorError,
  } = useGetCreatorCourseQuery(undefined, { skip: !showCreatorCourses });

  const enrolledCourses = (user?.enrolledCourses || []).map((course) => ({
    ...course,
    courseThumbnail: resolveCourseThumbnail(course),
  }));
  const creatorCourses = (creatorData?.courses || []).map((course) =>
    enrichCourseForClient(course)
  );
  const progressByCourseId = new Map(
    (progressData?.progress || []).map((entry) => [
      String(entry.courseId?._id || entry.courseId),
      entry,
    ])
  );

  const dashboardStats = useMemo(() => {
    const progressList = progressData?.progress || [];
    return {
      inProgress: progressList.filter(
        (entry) => (entry.progress ?? 0) > 0 && (entry.progress ?? 0) < 100
      ).length,
      completed: progressList.filter((entry) => (entry.progress ?? 0) >= 100).length,
      certificates: progressList.filter((entry) => entry.certificateEarned).length,
    };
  }, [progressData?.progress]);

  const continueTarget = useMemo(
    () =>
      pickContinueCourse({
        enrolledCourses,
        progressData,
        progressByCourseId,
      }),
    [enrolledCourses, progressData, progressByCourseId]
  );

  const isPageLoading = isLoading || (showCreatorCourses && creatorLoading);
  const hasEnrolledCourses = enrolledCourses.length > 0;
  const hasCreatorCourses = creatorCourses.length > 0;
  const hasAnyCourses = hasEnrolledCourses || hasCreatorCourses;

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
      <Breadcrumbs items={[{ label: t("navigation.my_space") }]} />

      <div className="mb-8">
        <p className="text-sm font-semibold uppercase tracking-[0.14em] text-primary">
          {t("dashboard.eyebrow")}
        </p>
        <h1 className="mt-2 font-hero text-3xl font-semibold tracking-tight text-foreground">
          {t("navigation.my_space")}
        </h1>
        <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
          {t("dashboard.subtitle")}
        </p>
      </div>

      {isPageLoading ? (
        <MyLearningSkeleton />
      ) : error ? (
        <div className="rounded-lg border border-destructive/20 bg-destructive/5 px-4 py-3 text-sm text-destructive">
          <p>Error loading courses: {error?.message || "Unknown error"}</p>
          <p>Please try refreshing the page.</p>
        </div>
      ) : !hasAnyCourses ? (
        <div className="rounded-xl border border-dashed border-border bg-muted/20 px-6 py-10 text-center">
          <p className="text-muted-foreground">{t("student.no_enrolled_courses")}</p>
          <Button asChild className="mt-4 rounded-lg">
            <Link to={ROUTES.catalog}>{t("student.explore_catalog_cta")}</Link>
          </Button>
        </div>
      ) : (
        <div className="space-y-10">
          {hasEnrolledCourses && (
            <>
              {continueTarget && (
                <ContinueLearningCard
                  course={continueTarget.course}
                  progressEntry={continueTarget.progressEntry}
                />
              )}

              <div className="grid gap-4 sm:grid-cols-3">
                <DashboardStatCard
                  icon={BookOpen}
                  label={t("dashboard.stats_in_progress")}
                  value={dashboardStats.inProgress}
                />
                <DashboardStatCard
                  icon={GraduationCap}
                  label={t("dashboard.stats_completed")}
                  value={dashboardStats.completed}
                />
                <DashboardStatCard
                  icon={Award}
                  label={t("dashboard.stats_certificates")}
                  value={dashboardStats.certificates}
                />
              </div>
            </>
          )}

          {hasEnrolledCourses && (
            <section className="space-y-4">
              <div>
                <h2 className="text-xl font-semibold text-foreground">
                  {t("student.enrolled_courses_title")}
                </h2>
                <p className="text-sm text-muted-foreground">
                  {t("student.enrolled_courses_description")}
                </p>
              </div>
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
                {enrolledCourses.map((course) => (
                  <Course
                    key={course._id}
                    course={course}
                    progressSummary={progressByCourseId.get(String(course._id))}
                    size="large"
                    showPrice={false}
                  />
                ))}
              </div>
            </section>
          )}

          {showCreatorCourses && hasCreatorCourses && (
            <section className="space-y-4">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
                <div>
                  <h2 className="text-xl font-semibold text-foreground">
                    {t("student.instructor_courses_title")}
                  </h2>
                  <p className="text-sm text-muted-foreground">
                    {t("student.instructor_courses_description")}
                  </p>
                </div>
                <Button asChild variant="outline">
                  <Link to={ROUTES.studio}>{t("admin.manage_courses")}</Link>
                </Button>
              </div>
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
                {creatorCourses.map((course) => (
                  <Course
                    key={course._id}
                    course={course}
                    size="large"
                    showPrice={false}
                  />
                ))}
              </div>
            </section>
          )}

          {showCreatorCourses && creatorError && !hasCreatorCourses && (
            <div className="rounded-lg border border-destructive/20 bg-destructive/5 px-4 py-3 text-sm text-destructive">
              {t("student.instructor_courses_error")}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

const DashboardStatCard = ({ icon: Icon, label, value }) => (
  <div className="rounded-xl border border-border bg-card px-4 py-4 shadow-sm">
    <div className="flex items-center gap-2 text-muted-foreground">
      <Icon className="h-4 w-4 text-primary" />
      <span className="text-sm">{label}</span>
    </div>
    <p className="mt-2 text-2xl font-semibold text-foreground">{value}</p>
  </div>
);

export default MyLearning;

const MyLearningSkeleton = () => (
  <div className="space-y-6">
    <Skeleton className="h-48 w-full rounded-2xl" />
    <div className="grid gap-4 sm:grid-cols-3">
      {[...Array(3)].map((_, index) => (
        <Skeleton key={index} className="h-24 rounded-xl" />
      ))}
    </div>
    <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
      {[...Array(3)].map((_, index) => (
        <div key={index} className="overflow-hidden rounded-xl border border-border bg-card">
          <Skeleton className="h-48 w-full" />
          <div className="space-y-3 p-5">
            <Skeleton className="h-6 w-3/4" />
            <Skeleton className="h-4 w-1/2" />
            <Skeleton className="h-10 w-full rounded-lg" />
          </div>
        </div>
      ))}
    </div>
  </div>
);
