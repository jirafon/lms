import { Skeleton } from "@/components/ui/skeleton";
import React from "react";
import Course from "./Course";
import { useGetPublishedCourseQuery } from "@/features/api/courseApi";
import { ArrowRight, ShieldCheck, Sparkles } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
 
const Courses = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const {data, isLoading, isError} = useGetPublishedCourseQuery();
 
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
           data?.courses && data.courses.map((course, index) => <Course key={index} course={course} size="large"/>) 
          )}
        </div>
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
