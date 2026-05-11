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
import { BadgeInfo, Lock, PlayCircle, BarChart3, AlertTriangle, Sparkles, Users, BookOpen } from "lucide-react";
import { useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "sonner";
import { useTranslation } from 'react-i18next';

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
            className="block rounded border px-3 py-2 text-sm text-blue-600 hover:underline"
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
  const courseLevelLabel = {
    Beginner: t("course.beginner"),
    Medium: t("course.medium"),
    Advance: t("course.advance"),
  }[course?.courseLevel] || t("course.beginner");
  const firstLecture = course?.lectures?.[0];
  const courseTitle = course?.courseTitle || course?.title || "Curso";
  const courseSummary = course?.subTitle || course?.description || "";
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

  if (isLoading) return <h1>{t('common.loading')}</h1>;
  if (isError || !course) return <h1>{t('common.error')}</h1>;

  const handleContinueCourse = () => {
    if(purchased){
      navigate(`/course-progress/${courseId}`)
    }
  }

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,_rgba(14,165,233,0.12),_transparent_28%),radial-gradient(circle_at_top_right,_rgba(249,115,22,0.10),_transparent_24%),linear-gradient(180deg,_#f8fafc_0%,_#eef2ff_100%)] dark:bg-[linear-gradient(180deg,_#111827_0%,_#0f172a_100%)]">
      <div className="border-b border-black/5 bg-slate-950 text-white">
        <div className="max-w-7xl mx-auto px-4 py-10 md:px-8 md:py-14">
          <div className="max-w-4xl space-y-5">
            <div className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1 text-xs uppercase tracking-[0.24em] text-slate-200">
              <Sparkles className="h-3.5 w-3.5" />
              {course?.category || "Curso"}
            </div>

            <div className="space-y-3">
              <h1 className="font-serif text-3xl leading-tight text-white md:text-5xl">
                {courseTitle}
              </h1>
              {courseSummary && (
                <p className="max-w-3xl text-sm leading-6 text-slate-300 md:text-base">
                  {courseSummary}
                </p>
              )}
            </div>

            <div className="flex flex-wrap items-center gap-3 text-sm text-slate-300">
              <div className="inline-flex items-center gap-2 rounded-full bg-white/8 px-3 py-1.5">
                <BookOpen className="h-4 w-4 text-sky-300" />
                {course?.lectures?.length || 0} capitulos
              </div>
              <div className="inline-flex items-center gap-2 rounded-full bg-white/8 px-3 py-1.5">
                <BarChart3 className="h-4 w-4 text-violet-300" />
                ~{estimatedMinutes} min estimados
              </div>
              <div className="inline-flex items-center gap-2 rounded-full bg-white/8 px-3 py-1.5">
                <Users className="h-4 w-4 text-orange-300" />
                {course?.enrolledStudents?.length || 0} inscritos
              </div>
              <div className="inline-flex items-center gap-2 rounded-full bg-white/8 px-3 py-1.5">
                <BadgeInfo className="h-4 w-4 text-emerald-300" />
                Actualizado {formatDate(course?.createdAt)}
              </div>
            </div>

            <p className="text-sm text-slate-400">
              Creado por <span className="font-medium text-white">{course?.creator?.name || "Equipo"}</span>
            </p>
          </div>
        </div>
      </div>
      
      <div className="max-w-7xl mx-auto px-4 py-8 md:px-8 md:py-10">
        <div className="flex flex-col-reverse gap-8 lg:flex-row lg:items-start lg:justify-between">
          <div className="w-full lg:w-[58%] space-y-6">
            <Card className="overflow-hidden border-white/50 bg-white/80 shadow-[0_20px_60px_rgba(15,23,42,0.08)] backdrop-blur">
              <CardContent className="p-6 md:p-8">
                <div className="mb-4 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.22em] text-slate-500">
                  <span className="h-px w-8 bg-slate-300" />
                  Resumen del curso
                </div>
                <div
                  className="prose prose-sm max-w-none text-slate-700 prose-p:leading-7"
                  dangerouslySetInnerHTML={{ __html: course.description || "" }}
                />
              </CardContent>
            </Card>

            <Card className="border-white/50 bg-white/85 shadow-[0_20px_60px_rgba(15,23,42,0.08)] backdrop-blur">
              <CardHeader>
                <CardTitle className="text-xl text-slate-900">Contenido del curso</CardTitle>
                <CardDescription>{course.lectures.length} capitulos disponibles</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {course.lectures.map((lecture, idx) => (
                  <div key={idx} className="flex items-start gap-4 rounded-2xl border border-slate-200/80 bg-slate-50/80 p-4 text-sm transition-colors hover:bg-white">
                    <span className="mt-0.5 rounded-full bg-white p-2 text-slate-700 shadow-sm">
                      {purchased ? <PlayCircle size={14} /> : <Lock size={14} />}
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="font-semibold text-slate-900">{lecture.lectureTitle}</p>
                      {lecture.lectureDescription && (
                        <p className="mt-1 text-sm leading-6 text-slate-600">
                          {lecture.lectureDescription}
                        </p>
                      )}
                    </div>
                    <span className="text-xs font-medium uppercase tracking-wide text-slate-400">
                      {purchased && progress?.lectures?.find((entry) => String(entry.lectureId?._id || entry.lectureId) === String(lecture._id))?.quizCompleted ? "Aprobado" : idx + 1}
                    </span>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>

          <div className="w-full lg:sticky lg:top-6 lg:w-[34%]">
            <Card className="overflow-hidden border-slate-200/80 bg-white/90 shadow-[0_25px_70px_rgba(15,23,42,0.12)] backdrop-blur">
              <CardContent className="flex flex-col p-4 md:p-5">
                <div className="mb-4 overflow-hidden rounded-2xl border border-slate-200 bg-slate-100">
                  <div className="aspect-video w-full bg-slate-100">
                    {course?.courseThumbnail ? (
                      <img
                        src={course.courseThumbnail}
                        alt={courseTitle}
                        className="h-full w-full object-cover"
                        onError={() => {
                          toast.error("No se pudo cargar la imagen del curso");
                        }}
                      />
                    ) : (
                      <div className="flex h-full w-full flex-col items-center justify-center rounded-lg bg-gray-100 p-6 dark:bg-gray-800">
                        <AlertTriangle className="mb-4 h-12 w-12 text-yellow-500" />
                        <h3 className="mb-2 text-lg font-semibold">Imagen no disponible</h3>
                        <p className="text-center text-sm text-gray-600">
                          Este curso no tiene miniatura configurada
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                <div className="space-y-3">
                  {purchased && (
                    <div className="rounded-2xl border border-emerald-100 bg-emerald-50 px-4 py-3 text-sm text-emerald-900">
                      <p className="font-semibold">Siguiente acción recomendada</p>
                      <p className="mt-1">
                        {progress?.courseProgress === 100
                          ? "Ya completaste el curso. Puedes revisar el contenido o descargar tu certificado."
                          : `Continúa con ${nextUnlockedLecture?.lectureTitle || firstLecture?.lectureTitle}. Llevas ${completedQuizzes}/${totalLectures} quizzes aprobados.`}
                      </p>
                    </div>
                  )}
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
                      Primer capitulo
                    </p>
                    <h2 className="mt-2 text-xl font-semibold text-slate-900">
                      {firstLecture?.lectureTitle || "Lecture title"}
                    </h2>
                    {firstLecture?.lectureDescription && (
                      <p className="mt-2 text-sm leading-6 text-slate-600">
                        {firstLecture.lectureDescription}
                      </p>
                    )}
                  </div>

                  {!purchased && (
                    <div className="flex items-end justify-between rounded-2xl bg-slate-950 px-4 py-4 text-white">
                      <div>
                        <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Precio</p>
                        <p className="mt-1 text-3xl font-semibold">{course?.currency || "USD"}${course?.coursePrice ?? 0}</p>
                        <p className="mt-1 text-xs uppercase tracking-[0.2em] text-slate-400">Por usuario</p>
                      </div>
                      <div className="text-right text-xs text-slate-400">
                        <p>{courseLevelLabel}</p>
                        <p className="mt-1">Acceso inmediato</p>
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
                    <Button onClick={handleContinueCourse} className="h-11 w-full bg-slate-950 text-white hover:bg-slate-800">
                      {continueLabel}
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => setShowProgress(!showProgress)}
                      className="h-11 w-full items-center gap-2 border-slate-300 bg-white"
                    >
                      <BarChart3 className="h-4 w-4" />
                      {showProgress ? 'Ocultar Progreso' : 'Ver Progreso'}
                    </Button>
                  </>
                ) : (
                  <BuyCourseButton courseId={courseId} />
                )}
              </CardFooter>
            </Card>
          </div>
        </div>
      </div>

      {/* Course Progress Section */}
      {purchased && showProgress && (
        <div className="max-w-7xl mx-auto px-4 md:px-8">
          <CourseProgress courseId={courseId} />
        </div>
      )}
    </div>
  );
};

export default CourseDetail;
