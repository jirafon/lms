import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import React from "react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import { resolveCourseThumbnail } from "@/utils/mediaUrl";

const formatSearchResultPrice = (course) => {
  if (course?.quoteOnly) {
    return "Contactenos para cotizar - Minimo 10 alumnos por grupo";
  }

  const clpAmount = course?.flowPricing?.price;

  if (clpAmount !== undefined && clpAmount !== null && !Number.isNaN(Number(clpAmount))) {
    return `${new Intl.NumberFormat("es-CL", {
      style: "currency",
      currency: "CLP",
      maximumFractionDigits: 0,
    }).format(Number(clpAmount))} CLP por usuario`;
  }

  return `${new Intl.NumberFormat("es-CL", {
    style: "currency",
    currency: "CLP",
    maximumFractionDigits: 0,
  }).format(Number(course?.coursePrice ?? 0))} CLP por usuario`;
};

const getCourseLevelLabel = (courseLevel, t) => {
  return {
    Beginner: t("course.beginner"),
    Begginer: t("course.beginner"),
    Medium: t("course.medium"),
    Advance: t("course.advance"),
  }[courseLevel] || courseLevel || t("course.beginner");
};

const SearchResult = ({ course }) => {
  const { t } = useTranslation();
  const thumbnailSrc = resolveCourseThumbnail(course);

  return (
    <Card className="overflow-hidden border-border shadow-sm transition-shadow hover:shadow-md">
      <Link
        to={`/course-detail/${course._id}`}
        className="flex flex-col gap-4 p-4 md:flex-row md:items-center"
      >
        <img
          src={thumbnailSrc}
          alt={course.courseTitle}
          className="h-32 w-full rounded-lg object-cover md:w-52"
        />
        <div className="min-w-0 flex-1 space-y-2">
          <h2 className="text-lg font-semibold text-foreground md:text-xl">
            {course.courseTitle}
          </h2>
          {course.subTitle && (
            <p className="line-clamp-2 text-sm text-muted-foreground">{course.subTitle}</p>
          )}
          <p className="text-sm text-muted-foreground">
            Instructor: <span className="font-medium text-foreground">{course.creator?.name}</span>
          </p>
          <Badge variant="outline" className="w-fit rounded-md">
            {getCourseLevelLabel(course.courseLevel, t)}
          </Badge>
        </div>
        <div className="shrink-0 text-left md:text-right">
          <p className="text-base font-semibold text-foreground md:text-lg">
            {formatSearchResultPrice(course)}
          </p>
        </div>
      </Link>
    </Card>
  );
};

export default SearchResult;
