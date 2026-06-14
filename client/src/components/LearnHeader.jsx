import { ArrowLeft, BookOpen, LayoutGrid } from "lucide-react";
import { Link, useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Progress } from "@/components/ui/progress";
import { useGetCourseDetailWithStatusQuery } from "@/features/api/purchaseApi";
import { useGetCourseProgressQuery } from "@/features/api/courseProgressApi";
import { ROUTES } from "@/utils/routes";

const LearnHeader = () => {
  const { t } = useTranslation();
  const { courseId } = useParams();
  const { data: courseData, isLoading: courseLoading } =
    useGetCourseDetailWithStatusQuery(courseId);
  const { data: progressData } = useGetCourseProgressQuery(courseId);

  const courseTitle =
    courseData?.course?.courseTitle || courseData?.course?.title || "";
  const courseProgress = progressData?.progress?.courseProgress || 0;

  return (
    <header className="sticky top-0 z-50 border-b border-border/80 bg-white/95 backdrop-blur-md dark:bg-slate-950/95">
      <div className="mx-auto flex h-14 max-w-7xl items-center gap-3 px-4 sm:px-6 lg:px-8">
        <Link
          to={ROUTES.app}
          className="inline-flex shrink-0 items-center gap-1.5 rounded-lg px-2 py-1.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted/60 hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
          <span className="hidden sm:inline">{t("learn.back_to_space")}</span>
        </Link>

        <div className="hidden h-5 w-px bg-border md:block" />

        <Link
          to={ROUTES.course(courseId)}
          className="hidden items-center gap-1.5 rounded-lg px-2 py-1.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted/60 hover:text-foreground md:inline-flex"
        >
          <LayoutGrid className="h-4 w-4" />
          {t("learn.course_overview")}
        </Link>

        <div className="min-w-0 flex-1 text-center md:text-left">
          {courseLoading ? (
            <div className="mx-auto h-4 w-40 animate-pulse rounded bg-muted md:mx-0" />
          ) : (
            <p className="truncate text-sm font-semibold text-foreground">
              {courseTitle}
            </p>
          )}
        </div>

        <div className="hidden min-w-[140px] items-center gap-2 sm:flex">
          <BookOpen className="h-4 w-4 shrink-0 text-primary" />
          <Progress value={courseProgress} className="h-2 flex-1" />
          <span className="w-9 shrink-0 text-right text-xs font-semibold text-foreground">
            {courseProgress}%
          </span>
        </div>
      </div>
    </header>
  );
};

export default LearnHeader;
