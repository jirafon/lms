import BuyCourseButton from "@/components/BuyCourseButton";
import CourseProgress from "@/components/CourseProgress";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { useGetCourseProgressQuery } from "@/features/api/courseProgressApi";
import { useGetCourseDetailWithStatusQuery } from "@/features/api/purchaseApi";
import { Badge } from "@/components/ui/badge";
import { BadgeInfo, Lock, PlayCircle, BarChart3, AlertTriangle, Users, BookOpen } from "lucide-react";
import { useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ROUTES } from "@/utils/routes";
import { toast } from "sonner";
import { useTranslation } from 'react-i18next';
import { resolveCourseThumbnail } from "@/utils/mediaUrl";
import Breadcrumbs from "@/components/Breadcrumbs";

const renderSupportMaterials = (lecture) => {
  if (!lecture?.supportMaterials?.length) {
    return null;
  }

  return (
    <div className="mt-4">
      <h2 className="text-base font-semibold">Downloadable files</h2>
      <div className="mt-2 space-y-2">
        {lecture.supportMaterials.map((material) => (
          <a
            key={material.url}
            href={material.url}
            target="_blank"
            rel="noreferrer"
            className="block rounded-lg border border-border px-3 py-2 text-sm text-primary hover:bg-muted/40"
          >
            {material.name}
          </a>
        ))}
      </div>
    </div>
  );
};

const formatDate = (value) => {
  if (!value) {
    return "";
  }

  return new Date(value).toLocaleDateString("es-CL", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

const formatDisplayPrice = ({ amount, currency }) => {
  if (amount === undefined || amount === null || Number.isNaN(Number(amount))) {
    return "$0";
  }

  if (currency === "CLP") {
    return `${new Intl.NumberFormat("es-CL", {
      style: "currency",
      currency: "CLP",
      maximumFractionDigits: 0,
    }).format(Number(amount))} CLP`;
  }

  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: currency || "USD",
    maximumFractionDigits: 0,
  }).format(Number(amount));
};

const CourseDetail = () => {
  const { t } = useTranslation();
  const params = useParams();
  const { courseId } = params;
  const navigate = useNavigate();
  const [showProgress, setShowProgress] = useState(false);
  const { data, isLoading, isError } =
    useGetCourseDetailWithStatusQuery(courseId);
  const { data: progressData } = useGetCourseProgressQuery(courseId, {
    skip: !data?.purchased,
  });

  const course = data?.course;
  const purchased = data?.purchased;
  const flowCheckout = data?.checkoutOptions?.flow;
  const courseLevelLabel = {
    Beginner: t("course.beginner"),
    Begginer: t("course.beginner"),
    Medium: t("course.medium"),
    Advance: t("course.advance"),
  }[course?.courseLevel] || t("course.beginner");
  const firstLecture = course?.lectures?.[0];
  const courseTitle = course?.courseTitle || course?.title || "Curso";
  const courseSummary = course?.subTitle || course?.description || "";
  const thumbnailSrc = resolveCourseThumbnail(course);
  const progress = progressData?.progress;
  const completedQuizzes = progress?.completedQuizzes || 0;
  const totalLectures = course?.lectures?.length || 0;
  const estimatedMinutes = totalLectures * 12;
  const nextUnlockedLecture = useMemo(() => {
    if (!course?.lectures?.length || !progress?.lectures) {
      return firstLecture;
    }

    const progressByLectureId = new Map(
      progress.lectures.map((entry) => [String(entry.lectureId?._id || entry.lectureId), entry])
    );

    return (
      course.lectures.find((lecture, index) => {
        if (index === 0) {
          return !progressByLectureId.get(String(lecture._id))?.quizCompleted;
        }

        const previousLecture = course.lectures[index - 1];
        return Boolean(progressByLectureId.get(String(previousLecture._id))?.quizCompleted) &&
          !progressByLectureId.get(String(lecture._id))?.quizCompleted;
      }) || firstLecture
    );
  }, [course?.lectures, progress?.lectures, firstLecture]);

  const continueLabel = progress?.courseProgress
    ? `Continuar desde ${nextUnlockedLecture?.lectureTitle || "tu progreso"}`
    : "Comenzar curso";
  const displayPriceLabel = course?.quoteOnly
    ? "Contactenos para cotizar"
    : flowCheckout?.available
    ? formatDisplayPrice({ amount: flowCheckout.amount, currency: flowCheckout.currency })
    : formatDisplayPrice({ amount: course?.coursePrice ?? 0, currency: course?.currency || "CLP" });

  if (isLoading) return <h1>{t('common.loading')}</h1>;
  if (isError || !course) return <h1>{t('common.error')}</h1>;

  const handleContinueCourse = () => {
    if(purchased){
      navigate(ROUTES.courseLearn(courseId))
    }
  }

  return (
    <div className="min-h-screen bg-muted/30">
      <div className="mx-auto max-w-7xl px-4 pt-8 md:px-8">
        <Breadcrumbs
          items={[
            { label: t("navigation.catalog"), to: ROUTES.catalog },
            { label: courseTitle },
          ]}
        />
      </div>
      <div className="border-b border-border bg-white dark:bg-slate-950">
        <div className="mx-auto max-w-7xl px-4 py-10 md:px-8 md:py-12">
          <div className="max-w-4xl space-y-5">
            <Badge variant="secondary" className="rounded-md px-3 py-1 text-xs font-medium uppercase tracking-wide">
              {course?.category || "Curso"}
            </Badge>

            <div className="space-y-3">
              <h1 className="font-hero text-3xl font-semibold leading-tight text-foreground md:text-4xl lg:text-5xl">
                {courseTitle}
              </h1>
              {courseSummary && (
                <p className="max-w-3xl text-base leading-7 text-muted-foreground">
                  {courseSummary}
                </p>
              )}
            </div>

            <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
              <div className="inline-flex items-center gap-2 rounded-lg border border-border bg-muted/40 px-3 py-1.5">
                <BookOpen className="h-4 w-4 text-primary" />
                {course?.lectures?.length || 0} capitulos
              </div>
              <div className="inline-flex items-center gap-2 rounded-lg border border-border bg-muted/40 px-3 py-1.5">
                <BarChart3 className="h-4 w-4 text-primary" />
                ~{estimatedMinutes} min estimados
              </div>
              <div className="inline-flex items-center gap-2 rounded-lg border border-border bg-muted/40 px-3 py-1.5">
                <Users className="h-4 w-4 text-primary" />
                {course?.enrolledStudents?.length || 0} inscritos
              </div>
              <div className="inline-flex items-center gap-2 rounded-lg border border-border bg-muted/40 px-3 py-1.5">
                <BadgeInfo className="h-4 w-4 text-primary" />
                Actualizado {formatDate(course?.createdAt)}
              </div>
            </div>

            <p className="text-sm text-muted-foreground">
              Creado por <span className="font-medium text-foreground">{course?.creator?.name || "Equipo"}</span>
            </p>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 py-8 md:px-8 md:py-10">
        <div className="flex flex-col-reverse gap-8 lg:flex-row lg:items-start lg:justify-between">
          <div className="w-full space-y-6 lg:w-[58%]">
            <Card className="border-border shadow-sm">
              <CardContent className="p-6 md:p-8">
                <p className="text-xs font-semibold uppercase tracking-[0.12em] text-muted-foreground">
                  Resumen del curso
                </p>
                <div
                  className="prose prose-sm mt-4 max-w-none text-foreground prose-p:leading-7"
                  dangerouslySetInnerHTML={{ __html: course.description || "" }}
                />
              </CardContent>
            </Card>

            <Card className="border-border shadow-sm">
              <CardHeader>
                <CardTitle className="font-hero text-xl">Contenido del curso</CardTitle>
                <CardDescription>{course.lectures.length} capitulos disponibles</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {course.lectures.map((lecture, idx) => (
                  <div
                    key={idx}
                    className="flex items-start gap-4 rounded-lg border border-border bg-muted/20 p-4 text-sm transition-colors hover:bg-muted/40"
                  >
                    <span className="mt-0.5 rounded-md bg-background p-2 text-muted-foreground shadow-sm">
                      {purchased ? <PlayCircle size={14} /> : <Lock size={14} />}
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="font-medium text-foreground">{lecture.lectureTitle}</p>
                      {lecture.lectureDescription && (
                        <p className="mt-1 text-sm leading-6 text-muted-foreground">
                          {lecture.lectureDescription}
                        </p>
                      )}
                    </div>
                    <span className="text-xs font-medium text-muted-foreground">
                      {purchased && progress?.lectures?.find((entry) => String(entry.lectureId?._id || entry.lectureId) === String(lecture._id))?.quizCompleted ? "Aprobado" : idx + 1}
                    </span>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>

          <div className="w-full lg:sticky lg:top-20 lg:w-[34%]">
            <Card className="overflow-hidden border-border shadow-sm">
              <CardContent className="flex flex-col p-4 md:p-5">
                <div className="mb-4 overflow-hidden rounded-lg border border-border bg-muted/30">
                  <div className="aspect-video w-full">
                    {thumbnailSrc ? (
                      <img
                        src={thumbnailSrc}
                        alt={courseTitle}
                        className="h-full w-full object-cover"
                        onError={() => {
                          toast.error("No se pudo cargar la imagen del curso");
                        }}
                      />
                    ) : (
                      <div className="flex h-full w-full flex-col items-center justify-center bg-muted/40 p-6">
                        <AlertTriangle className="mb-4 h-12 w-12 text-amber-500" />
                        <h3 className="mb-2 text-lg font-semibold">Imagen no disponible</h3>
                        <p className="text-center text-sm text-muted-foreground">
                          Este curso no tiene miniatura configurada
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                <div className="space-y-3">
                  {purchased && (
                    <div className="rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-900 dark:border-emerald-900/40 dark:bg-emerald-950/30 dark:text-emerald-200">
                      <p className="font-semibold">Siguiente accion recomendada</p>
                      <p className="mt-1">
                        {progress?.courseProgress === 100
                          ? "Ya completaste el curso. Puedes revisar el contenido o descargar tu certificado."
                          : `Continua con ${nextUnlockedLecture?.lectureTitle || firstLecture?.lectureTitle}. Llevas ${completedQuizzes}/${totalLectures} quizzes aprobados.`}
                      </p>
                    </div>
                  )}
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.12em] text-muted-foreground">
                      Primer capitulo
                    </p>
                    <h2 className="mt-2 text-xl font-semibold text-foreground">
                      {firstLecture?.lectureTitle || "Lecture title"}
                    </h2>
                    {firstLecture?.lectureDescription && (
                      <p className="mt-2 text-sm leading-6 text-muted-foreground">
                        {firstLecture.lectureDescription}
                      </p>
                    )}
                  </div>

                  {!purchased && (
                    <div className="rounded-lg border border-border bg-foreground px-4 py-4 text-background">
                      <p className="text-xs uppercase tracking-[0.12em] opacity-70">Precio</p>
                      <p className="mt-1 text-3xl font-semibold">{displayPriceLabel}</p>
                      <p className="mt-1 text-xs uppercase tracking-[0.12em] opacity-70">
                        {course?.quoteOnly ? "Minimo 10 alumnos por grupo" : "Por usuario"}
                      </p>
                      <div className="mt-3 flex justify-between text-xs opacity-70">
                        <span>{courseLevelLabel}</span>
                        <span>{course?.quoteOnly ? "Compra individual deshabilitada" : "Acceso inmediato"}</span>
                      </div>
                    </div>
                  )}
                </div>

                {renderSupportMaterials(firstLecture)}
                <Separator className="my-4" />
              </CardContent>

              <CardFooter className="flex flex-col gap-2 p-4">
                {purchased ? (
                  <>
                    <Button onClick={handleContinueCourse} className="min-h-11 w-full rounded-lg py-3">
                      {continueLabel}
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => setShowProgress(!showProgress)}
                      className="h-11 w-full rounded-lg"
                    >
                      <BarChart3 className="mr-2 h-4 w-4" />
                      {showProgress ? "Ocultar progreso" : "Ver progreso"}
                    </Button>
                  </>
                ) : course?.quoteOnly ? (
                  <div className="w-full rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
                    Contactenos para cotizar este curso grupal. Minimo 10 alumnos por grupo.
                  </div>
                ) : (
                  <BuyCourseButton courseId={courseId} flowCheckout={flowCheckout} />
                )}
              </CardFooter>
            </Card>
          </div>
        </div>
      </div>

      {purchased && showProgress && (
        <div className="mx-auto max-w-7xl px-4 pb-10 md:px-8">
          <CourseProgress courseId={courseId} />
        </div>
      )}
    </div>
  );
};

export default CourseDetail;
