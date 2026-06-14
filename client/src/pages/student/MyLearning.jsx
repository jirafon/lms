import React from "react";
import Course from "./Course";
import { useLoadUserQuery } from "@/features/api/authApi";
import { useGetUserProgressQuery } from "@/features/api/courseProgressApi";
import { Skeleton } from "@/components/ui/skeleton";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { isInstructor } from "@/utils/userRole";

const MyLearning = () => {
  const { t } = useTranslation();
  const { data, isLoading, error } = useLoadUserQuery();
  const { data: progressData } = useGetUserProgressQuery();

  const myLearning = data?.user?.enrolledCourses || [];
  const progressByCourseId = new Map(
    (progressData?.progress || []).map((entry) => [String(entry.courseId?._id || entry.courseId), entry])
  );

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

      {isLoading ? (
        <MyLearningSkeleton />
      ) : error ? (
        <div className="rounded-lg border border-destructive/20 bg-destructive/5 px-4 py-3 text-sm text-destructive">
          <p>Error loading courses: {error?.message || "Unknown error"}</p>
          <p>Please try refreshing the page.</p>
        </div>
      ) : myLearning.length === 0 ? (
        <div className="rounded-xl border border-dashed border-border bg-muted/20 px-6 py-10 text-center">
          {isInstructor(data?.user) ? (
            <div className="mx-auto max-w-md space-y-4">
              <p className="text-muted-foreground">{t("student.instructor_no_enrolled_courses")}</p>
              <Button asChild>
                <Link to="/admin/course">{t("admin.manage_courses")}</Link>
              </Button>
            </div>
          ) : (
            <p className="text-muted-foreground">{t("student.no_enrolled_courses")}</p>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
          {myLearning.map((course) => (
            <Course
              key={course._id}
              course={course}
              progressSummary={progressByCourseId.get(String(course._id))}
              size="large"
              showPrice={false}
            />
          ))}
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
