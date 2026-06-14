import { ArrowRight, PlayCircle } from "lucide-react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { ROUTES } from "@/utils/routes";
import { resolveCourseThumbnail } from "@/utils/mediaUrl";

const ContinueLearningCard = ({ course, progressEntry }) => {
  const { t } = useTranslation();

  if (!course?._id) {
    return null;
  }

  const courseId = String(course._id);
  const progressPercent = progressEntry?.progress ?? 0;
  const isCompleted = progressPercent >= 100;
  const thumbnailSrc = resolveCourseThumbnail(course);
  const courseTitle = course.courseTitle || course.title || t("dashboard.continue_course_fallback");

  return (
    <section className="overflow-hidden rounded-2xl border border-primary/20 bg-gradient-to-br from-primary/5 via-card to-card shadow-sm">
      <div className="grid gap-6 p-6 md:grid-cols-[1.2fr_0.8fr] md:items-center md:p-8">
        <div className="space-y-4">
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-primary">
            {isCompleted ? t("dashboard.course_completed_label") : t("dashboard.continue_where_left")}
          </p>
          <h2 className="font-hero text-2xl font-semibold tracking-tight text-foreground md:text-3xl">
            {courseTitle}
          </h2>
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm text-muted-foreground">
              <span>{t("dashboard.your_progress")}</span>
              <span className="font-semibold text-foreground">{progressPercent}%</span>
            </div>
            <Progress value={progressPercent} className="h-2.5" />
          </div>
          {progressEntry && (
            <p className="text-sm text-muted-foreground">
              {progressEntry.completedQuizzes ?? 0}/{progressEntry.totalQuizzes ?? progressEntry.totalLectures ?? 0}{" "}
              {t("learn.quizzes_passed")}
            </p>
          )}
          <Button asChild className="rounded-lg">
            <Link to={ROUTES.courseLearn(courseId)}>
              {isCompleted ? t("dashboard.review_course") : t("dashboard.continue_course")}
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>

        <div className="relative overflow-hidden rounded-xl border border-border bg-muted/30">
          {thumbnailSrc ? (
            <img
              src={thumbnailSrc}
              alt={courseTitle}
              className="aspect-video w-full object-cover"
            />
          ) : (
            <div className="flex aspect-video items-center justify-center bg-muted/50">
              <PlayCircle className="h-14 w-14 text-primary/40" />
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

export default ContinueLearningCard;
