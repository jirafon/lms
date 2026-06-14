import { Skeleton } from "@/components/ui/skeleton";
import React, { useEffect, useMemo, useState } from "react";
import Course from "./Course";
import { useGetPublishedCourseQuery } from "@/features/api/courseApi";
import { ArrowRight } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

const HOME_SELECTED_COURSE_KEY = "homeSelectedCourseId";

const Courses = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [selectedCourseId, setSelectedCourseId] = useState("");
  const [isCourseModalOpen, setIsCourseModalOpen] = useState(false);
  const { data, isLoading, isError } = useGetPublishedCourseQuery();
  const courses = data?.courses ?? [];

  const handleCourseSelection = (courseId) => {
    setSelectedCourseId(courseId);
    if (typeof window !== "undefined") {
      window.sessionStorage.setItem(HOME_SELECTED_COURSE_KEY, courseId);
    }
  };

  const handleCourseCardClick = (course) => {
    if (!course?._id) {
      return;
    }
    handleCourseSelection(course._id);
    setIsCourseModalOpen(true);
  };

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    const persistedCourseId = window.sessionStorage.getItem(HOME_SELECTED_COURSE_KEY);
    if (persistedCourseId) {
      setSelectedCourseId(persistedCourseId);
    }
  }, []);

  useEffect(() => {
    if (!courses.length) {
      setSelectedCourseId("");
      if (typeof window !== "undefined") {
        window.sessionStorage.removeItem(HOME_SELECTED_COURSE_KEY);
      }
      return;
    }

    if (!selectedCourseId || !courses.some((course) => course._id === selectedCourseId)) {
      handleCourseSelection(courses[0]._id);
    }
  }, [courses, selectedCourseId]);

  const selectedCourse = useMemo(
    () => courses.find((course) => course._id === selectedCourseId),
    [courses, selectedCourseId]
  );

  const selectedCourseDescription = useMemo(() => {
    const rawDescription = selectedCourse?.description || selectedCourse?.subTitle || "";
    return rawDescription.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
  }, [selectedCourse]);

  if (isError) return <h1>{t("home.courses_error")}</h1>;

  return (
    <section className="bg-muted/30 px-4 py-16 sm:px-6 lg:px-8 lg:py-20">
      <div className="mx-auto max-w-7xl">
        <div className="mb-10 flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-2xl">
            <p className="text-sm font-semibold uppercase tracking-[0.14em] text-primary">
              {t("home.courses_eyebrow")}
            </p>
            <h2 className="mt-3 font-hero text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
              {t("home.courses_title")}
            </h2>
            <p className="mt-3 text-base leading-7 text-muted-foreground sm:text-lg">
              {t("home.courses_description")}
            </p>
          </div>

          <Button
            type="button"
            variant="outline"
            onClick={() => navigate("/course/search?query")}
            className="h-10 shrink-0 rounded-lg"
          >
            {t("home.courses_cta")}
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {isLoading
            ? Array.from({ length: 6 }).map((_, index) => (
                <CourseSkeleton key={index} />
              ))
            : courses.map((course) => (
                <Course
                  key={course._id}
                  course={course}
                  size="large"
                  onCardClick={handleCourseCardClick}
                  disableNavigation
                />
              ))}
        </div>

        <Dialog open={isCourseModalOpen} onOpenChange={setIsCourseModalOpen}>
          <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-2xl">
            <DialogHeader>
              <DialogTitle>{selectedCourse?.courseTitle || "Curso"}</DialogTitle>
              <DialogDescription>Contenido del curso</DialogDescription>
            </DialogHeader>

            <div className="space-y-5">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.12em] text-muted-foreground">
                  Descripcion
                </p>
                <p className="mt-2 text-sm leading-7 text-foreground">
                  {selectedCourseDescription || "Este curso no tiene descripcion disponible por ahora."}
                </p>
              </div>

              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.12em] text-muted-foreground">
                  Capitulos
                </p>
                <ul className="mt-3 space-y-2">
                  {(selectedCourse?.lectures || []).length > 0 ? (
                    selectedCourse.lectures.map((lecture, index) => (
                      <li
                        key={lecture._id || `${lecture.lectureTitle}-${index}`}
                        className="rounded-lg border border-border bg-muted/30 px-4 py-2.5 text-sm text-foreground"
                      >
                        {lecture.lectureOrder || index + 1}. {lecture.lectureTitle || "Capitulo sin titulo"}
                      </li>
                    ))
                  ) : (
                    <li className="rounded-lg border border-dashed border-border px-4 py-3 text-sm text-muted-foreground">
                      Este curso aun no tiene capitulos publicados.
                    </li>
                  )}
                </ul>
              </div>

              <Button
                type="button"
                onClick={() => {
                  setIsCourseModalOpen(false);
                  navigate("/login");
                }}
                className="w-full rounded-lg"
              >
                Comprar curso
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </section>
  );
};

export default Courses;

const CourseSkeleton = () => {
  return (
    <div className="overflow-hidden rounded-xl border border-border bg-card shadow-sm">
      <Skeleton className="h-48 w-full" />
      <div className="space-y-4 p-5">
        <Skeleton className="h-6 w-3/4" />
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Skeleton className="h-9 w-9 rounded-full" />
            <Skeleton className="h-4 w-24" />
          </div>
          <Skeleton className="h-5 w-16 rounded-full" />
        </div>
        <Skeleton className="h-12 w-full rounded-lg" />
      </div>
    </div>
  );
};
