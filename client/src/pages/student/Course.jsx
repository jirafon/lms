import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { BookCheck, Clock3 } from "lucide-react";
import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";

const formatDate = (value) => {
  if (!value) {
    return "Sin actividad reciente";
  }

  return new Date(value).toLocaleDateString("es-CL", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

const getCourseCardPriceAmount = (course) => {
  if (course?.quoteOnly) {
    return "Contactenos para cotizar";
  }

  const clpAmount = course?.flowPricing?.price;

  if (clpAmount !== undefined && clpAmount !== null && !Number.isNaN(Number(clpAmount))) {
    return new Intl.NumberFormat("es-CL", {
      style: "currency",
      currency: "CLP",
      maximumFractionDigits: 0,
    }).format(Number(clpAmount));
  }

  return new Intl.NumberFormat("es-CL", {
    style: "currency",
    currency: "CLP",
    maximumFractionDigits: 0,
  }).format(Number(course?.coursePrice ?? 0));
};

const getCourseLevelLabel = (courseLevel, t) => {
  return {
    Beginner: t("course.beginner"),
    Begginer: t("course.beginner"),
    Medium: t("course.medium"),
    Advance: t("course.advance"),
  }[courseLevel] || courseLevel || t("course.beginner");
};

const Course = ({
  course,
  progressSummary,
  size = "default",
  showPrice = true,
  onCardClick,
  disableNavigation = false,
}) => {
  const { t } = useTranslation();
  const [imageError, setImageError] = useState(false);
  const [avatarError, setAvatarError] = useState(false);

  const handleImageError = () => {
    setImageError(true);
  };

  const handleAvatarError = () => {
    setAvatarError(true);
  };

  const courseProgress = progressSummary?.progress || 0;
  const isLarge = size === "large";

  const handleCardClick = () => {
    if (typeof onCardClick === "function") {
      onCardClick(course);
    }
  };

  const cardContent = (
      <Card className="overflow-hidden rounded-[30px] border border-[#e6ddd0] bg-[linear-gradient(180deg,#fffdf9_0%,#ffffff_100%)] shadow-[0_18px_45px_rgba(15,23,42,0.07)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_28px_65px_rgba(15,23,42,0.12)] dark:border-slate-700 dark:bg-slate-900">
        <div className="relative">
          <img
            src={imageError ? "https://via.placeholder.com/400x200/4F46E5/FFFFFF?text=Course+Image" : course.courseThumbnail}
            alt="course"
            className={`w-full object-cover ${isLarge ? "h-52" : "h-36"}`}
            onError={handleImageError}
          />
          <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,rgba(15,23,42,0.08)_0%,rgba(15,23,42,0)_42%,rgba(15,23,42,0.28)_100%)]" />
          <div className="pointer-events-none absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-slate-950/8 to-transparent" />
          <div className="absolute left-4 top-4 inline-flex max-w-[70%] items-center rounded-full border border-white/60 bg-white/75 px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-slate-800 backdrop-blur">
            {course.courseCategory || getCourseLevelLabel(course.courseLevel, t)}
          </div>
          <div className="pointer-events-none absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-slate-950/16 via-slate-950/0 to-transparent" />
        </div>
        <CardContent className={`${isLarge ? "px-6 py-5 space-y-4" : "px-5 py-4 space-y-3"}`}>
          <h1 className={`line-clamp-3 min-h-[5rem] sm:line-clamp-2 sm:min-h-[3.5rem] font-bold leading-snug text-slate-950 hover:underline dark:text-slate-100 ${isLarge ? "text-xl" : "text-lg"}`}>
            {course.courseTitle}
          </h1>
          <div className="flex items-center justify-between">
            <div className={`flex items-center ${isLarge ? "gap-4" : "gap-3"}`}>
              <Avatar className={isLarge ? "h-10 w-10" : "h-8 w-8"}>
                <AvatarImage
                  src={avatarError ? "https://github.com/shadcn.png" : (course.creator?.photoUrl || "https://github.com/shadcn.png")}
                  alt="@shadcn"
                  onError={handleAvatarError}
                />
                <AvatarFallback>CN</AvatarFallback>
              </Avatar>
              <h1 className={`font-medium text-slate-700 dark:text-slate-200 ${isLarge ? "text-base" : "text-sm"}`}>{course.creator?.name}</h1>
            </div>
            <Badge className={`rounded-full border border-amber-200 bg-amber-50 text-amber-900 dark:border-amber-900/60 dark:bg-amber-950/30 dark:text-amber-100 ${isLarge ? "px-3 py-1 text-sm" : "px-2 py-1 text-xs"}`}>
              {getCourseLevelLabel(course.courseLevel, t)}
            </Badge>
          </div>
          {showPrice && (
            <div className="space-y-1 rounded-2xl border border-slate-200 bg-[#fcfaf7] px-4 py-3 dark:border-slate-700 dark:bg-slate-950/70">
              <p className={`${isLarge ? "text-lg sm:text-xl" : "text-base sm:text-lg"} font-bold leading-none tracking-tight tabular-nums text-slate-950 dark:text-slate-100`}>
                {getCourseCardPriceAmount(course)}
              </p>
              <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
                {course?.quoteOnly ? "Minimo 10 alumnos por grupo" : "CLP por usuario"}
              </p>
            </div>
          )}
          {progressSummary && (
            <div className={`rounded-xl border border-slate-200 bg-slate-50 dark:border-slate-700 dark:bg-slate-900/40 ${isLarge ? "space-y-4 p-4" : "space-y-3 p-3"}`}>
              <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
                <span>Tu avance</span>
                <span className="font-semibold text-slate-900 dark:text-slate-100">{courseProgress}%</span>
              </div>
              <Progress value={courseProgress} className="h-2" />
              <div className={`grid grid-cols-2 gap-2 text-slate-600 dark:text-slate-300 ${isLarge ? "text-sm" : "text-xs"}`}>
                <div className="flex items-center gap-1">
                  <BookCheck className={isLarge ? "h-4 w-4" : "h-3.5 w-3.5"} />
                  {progressSummary.completedQuizzes}/{progressSummary.totalQuizzes} quizzes
                </div>
                <div className="flex items-center gap-1">
                  <Clock3 className={isLarge ? "h-4 w-4" : "h-3.5 w-3.5"} />
                  {formatDate(progressSummary.lastAccessedAt)}
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
  );

  if (disableNavigation) {
    return (
      <button
        type="button"
        onClick={handleCardClick}
        className="w-full text-left"
      >
        {cardContent}
      </button>
    );
  }

  return (
    <Link to={`/course-detail/${course._id}`} onClick={handleCardClick}>
      {cardContent}
    </Link>
  );
};

export default Course;
