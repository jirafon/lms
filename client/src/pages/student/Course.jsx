import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { BookCheck, BookOpen, Clock3 } from "lucide-react";
import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import { resolveCourseThumbnail, resolveUserPhoto } from "@/utils/mediaUrl";

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
  const thumbnailSrc = resolveCourseThumbnail(course);
  const creatorPhotoSrc = resolveUserPhoto(course?.creator);

  const handleCardClick = () => {
    if (typeof onCardClick === "function") {
      onCardClick(course);
    }
  };

  const cardContent = (
      <Card className="group overflow-hidden rounded-xl border border-border bg-card shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md">
        <div className="relative overflow-hidden">
          {!thumbnailSrc || imageError ? (
            <div
              className={`flex w-full items-center justify-center bg-muted/60 text-muted-foreground ${isLarge ? "h-48" : "h-36"}`}
              aria-label={course.courseTitle || "course"}
            >
              <BookOpen className="h-10 w-10 opacity-35" />
            </div>
          ) : (
            <img
              src={thumbnailSrc}
              alt={course.courseTitle || "course"}
              className={`w-full object-cover transition-transform duration-300 group-hover:scale-[1.02] ${isLarge ? "h-48" : "h-36"}`}
              onError={handleImageError}
            />
          )}
          <div className="absolute left-3 top-3">
            <Badge variant="secondary" className="rounded-md bg-white/95 px-2.5 py-0.5 text-[11px] font-medium text-foreground shadow-sm backdrop-blur">
              {course.courseCategory || getCourseLevelLabel(course.courseLevel, t)}
            </Badge>
          </div>
        </div>
        <CardContent className={`${isLarge ? "space-y-4 p-5" : "space-y-3 p-4"}`}>
          <h1 className={`line-clamp-2 font-semibold leading-snug text-foreground group-hover:text-primary ${isLarge ? "min-h-[3.25rem] text-lg" : "min-h-[2.75rem] text-base"}`}>
            {course.courseTitle}
          </h1>
          <div className="flex items-center justify-between gap-3">
            <div className={`flex min-w-0 items-center ${isLarge ? "gap-3" : "gap-2"}`}>
              <Avatar className={isLarge ? "h-8 w-8" : "h-7 w-7"}>
                <AvatarImage
                  src={avatarError ? "https://github.com/shadcn.png" : (creatorPhotoSrc || "https://github.com/shadcn.png")}
                  alt={course.creator?.name || "Instructor"}
                  onError={handleAvatarError}
                />
                <AvatarFallback>{course.creator?.name?.charAt(0) || "I"}</AvatarFallback>
              </Avatar>
              <span className={`truncate font-medium text-muted-foreground ${isLarge ? "text-sm" : "text-xs"}`}>
                {course.creator?.name}
              </span>
            </div>
            <Badge variant="outline" className="shrink-0 rounded-md text-[11px] font-medium">
              {getCourseLevelLabel(course.courseLevel, t)}
            </Badge>
          </div>
          {showPrice && (
            <div className="rounded-lg border border-border bg-muted/30 px-3.5 py-2.5">
              <p className={`font-semibold tabular-nums text-foreground ${isLarge ? "text-lg" : "text-base"}`}>
                {getCourseCardPriceAmount(course)}
              </p>
              <p className="text-xs text-muted-foreground">
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
