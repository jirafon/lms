import { Skeleton } from "@/components/ui/skeleton";
import React, { useEffect, useMemo, useState } from "react";
import Course from "./Course";
import { useGetPublishedCourseQuery } from "@/features/api/courseApi";
import { ArrowRight, ShieldCheck, Sparkles } from "lucide-react";
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
  const {data, isLoading, isError} = useGetPublishedCourseQuery();
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
 
  if(isError) return <h1>{t("home.courses_error")}</h1>

  return (
    <section className="relative overflow-hidden bg-[linear-gradient(180deg,#f5f1e8_0%,#faf6ef_24%,#ffffff_100%)] px-4 py-20 sm:px-6 lg:px-8">
      <div className="absolute inset-x-0 top-0 h-36 bg-[radial-gradient(circle_at_top,rgba(15,23,42,0.08),transparent_62%)]" />
      <div className="absolute inset-x-0 bottom-0 h-32 bg-[radial-gradient(circle_at_bottom,rgba(180,83,9,0.08),transparent_68%)]" />
      <div className="relative mx-auto max-w-7xl">
        <div className="mb-12 flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 rounded-full border border-slate-200/90 bg-white/85 px-4 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-slate-700 shadow-sm backdrop-blur">
              <ShieldCheck className="h-4 w-4 text-amber-700" />
              {t("home.courses_eyebrow")}
            </div>
            <h2 className="mt-5 font-serif text-3xl font-semibold tracking-tight text-slate-950 sm:text-4xl">
              {t("home.courses_title")}
            </h2>
            <p className="mt-4 max-w-2xl text-lg leading-8 text-slate-700">
              {t("home.courses_description")}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <div className="inline-flex items-center gap-2 rounded-full border border-white/80 bg-white/80 px-4 py-2 text-sm font-medium text-slate-700 shadow-sm ring-1 ring-slate-200/80 backdrop-blur">
              <Sparkles className="h-4 w-4 text-amber-700" />
              {t("home.courses_highlight")}
            </div>
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate("/course/search?query")}
              className="h-11 rounded-full border-slate-300 bg-[#111827] px-5 text-white hover:bg-[#1f2937] hover:text-white"
            >
              {t("home.courses_cta")}
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
          {isLoading ? (
            Array.from({ length: 8 }).map((_, index) => (
              <CourseSkeleton key={index} />
            ))
          ) : (
           courses.map((course) => (
            <Course
              key={course._id}
              course={course}
              size="large"
              onCardClick={handleCourseCardClick}
              disableNavigation
            />
           ))
          )}
        </div>

        <Dialog open={isCourseModalOpen} onOpenChange={setIsCourseModalOpen}>
          <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-2xl">
            <DialogHeader>
              <DialogTitle>
                {selectedCourse?.courseTitle || "Curso"}
              </DialogTitle>
              <DialogDescription>
                Contenido del curso
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-5">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">
                  Descripcion
                </p>
                <p className="mt-2 text-sm leading-7 text-slate-700">
                  {selectedCourseDescription || "Este curso no tiene descripcion disponible por ahora."}
                </p>
              </div>

              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">
                  Capitulos
                </p>
                <ul className="mt-3 space-y-2">
                  {(selectedCourse?.lectures || []).length > 0 ? (
                    selectedCourse.lectures.map((lecture, index) => (
                      <li
                        key={lecture._id || `${lecture.lectureTitle}-${index}`}
                        className="rounded-xl border border-[#ebe3d8] bg-[#fdfaf5] px-4 py-2 text-sm text-slate-700"
                      >
                        {lecture.lectureOrder || index + 1}. {lecture.lectureTitle || "Capitulo sin titulo"}
                      </li>
                    ))
                  ) : (
                    <li className="rounded-xl border border-dashed border-[#e7dccd] bg-[#fdfaf6] px-4 py-3 text-sm text-slate-500">
                      Este curso aun no tiene capitulos publicados.
                    </li>
                  )}
                </ul>
              </div>

              <div className="pt-2">
                <Button
                  type="button"
                  onClick={() => {
                    setIsCourseModalOpen(false);
                    navigate("/login");
                  }}
                  className="w-full rounded-xl bg-[#111827] text-white hover:bg-[#1f2937]"
                >
                  Comprar curso
                </Button>
              </div>
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
    <div className="overflow-hidden rounded-[30px] border border-[#e6ddd0] bg-[linear-gradient(180deg,#fffdf9_0%,#ffffff_100%)] shadow-[0_18px_45px_rgba(15,23,42,0.06)] transition-shadow hover:shadow-[0_24px_55px_rgba(15,23,42,0.1)]">
      <Skeleton className="w-full h-52" />
      <div className="px-6 py-5 space-y-4">
        <Skeleton className="h-7 w-3/4" />
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Skeleton className="h-10 w-10 rounded-full" />
            <Skeleton className="h-5 w-24" />
          </div>
          <Skeleton className="h-6 w-20" />
        </div>
        <Skeleton className="h-6 w-1/3" />
      </div>
    </div>
  );
};
