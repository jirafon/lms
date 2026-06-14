import React from "react";
import Course from "./Course";
import { useLoadUserQuery } from "@/features/api/authApi";
import { useGetCreatorCourseQuery } from "@/features/api/courseApi";
import { useGetUserProgressQuery } from "@/features/api/courseProgressApi";
import { Skeleton } from "@/components/ui/skeleton";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { isInstructor } from "@/utils/userRole";
import { enrichCourseForClient, resolveCourseThumbnail } from "@/utils/mediaUrl";

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
  const creatorCourses = (creatorData?.courses || []).map((course) => enrichCourseForClient(course));
  const progressByCourseId = new Map(
    (progressData?.progress || []).map((entry) => [
      String(entry.courseId?._id || entry.courseId),
      entry,
    ])
  );

  const isPageLoading = isLoading || (showCreatorCourses && creatorLoading);
  const hasEnrolledCourses = enrolledCourses.length > 0;
  const hasCreatorCourses = creatorCourses.length > 0;
  const hasAnyCourses = hasEnrolledCourses || hasCreatorCourses;

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="mb-8">
        <p className="text-sm font-semibold uppercase tracking-[0.14em] text-primary">
          Tu progreso
        </p>
        <h1 className="mt-2 font-hero text-3xl font-semibold tracking-tight text-foreground">
          {t("navigation.my_learning")}
        </h1>
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
        </div>
      ) : (
        <div className="space-y-10">
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
                  <Link to="/admin/course">{t("admin.manage_courses")}</Link>
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

export default MyLearning;

const MyLearningSkeleton = () => (
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
);
