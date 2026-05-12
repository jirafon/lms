import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { useGetCourseDetailWithStatusQuery } from "@/features/api/purchaseApi";
import {
  useGetCourseProgressQuery,
  useUpdateLectureProgressMutation,
} from "@/features/api/courseProgressApi";
import { useGetQuizByLectureQuery } from "@/features/api/quizApi";
import {
  AlertTriangle,
  Award,
  BookCheck,
  BookOpen,
  CheckCircle2,
  CirclePlay,
  Clock3,
  Lock,
  Target,
} from "lucide-react";
import React, { useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import { toast } from "sonner";
import TakeQuiz from "@/components/TakeQuiz";

const ESTIMATED_MINUTES_PER_LECTURE = 12;

const getLectureStatus = ({ lectureProgress, isUnlocked }) => {
  if (!isUnlocked) {
    return {
      label: "Bloqueado",
      tone: "text-slate-500",
      badgeClass: "border-slate-300 text-slate-500",
    };
  }

  if (lectureProgress?.quizCompleted) {
    return {
      label: "Aprobado",
      tone: "text-emerald-600",
      badgeClass: "border-emerald-200 text-emerald-700",
    };
  }

  if (lectureProgress?.watched) {
    return {
      label: "Quiz pendiente",
      tone: "text-amber-600",
      badgeClass: "border-amber-200 text-amber-700",
    };
  }

  return {
    label: "No iniciado",
    tone: "text-slate-600",
    badgeClass: "border-slate-300 text-slate-600",
  };
};

const CourseProgress = ({ courseId: courseIdProp }) => {
  const params = useParams();
  const courseId = courseIdProp || params.courseId;

  const { data: courseData, isLoading: courseLoading, isError: courseError } =
    useGetCourseDetailWithStatusQuery(courseId);
  const { data: progressData, isLoading: progressLoading, isError: progressError, refetch } =
    useGetCourseProgressQuery(courseId);
  const [updateLectureProgress] = useUpdateLectureProgressMutation();

  const [selectedLectureId, setSelectedLectureId] = useState(null);
  const [videoError, setVideoError] = useState(false);

  const {
    data: quizData,
    isLoading: quizLoading,
    isError: quizLoadError,
    refetch: refetchQuiz,
  } = useGetQuizByLectureQuery(selectedLectureId, {
    skip: !selectedLectureId,
  });

  const course = courseData?.course;
  const progress = progressData?.progress;
  const lectures = useMemo(() => course?.lectures || [], [course?.lectures]);

  const progressByLectureId = useMemo(() => {
    const entries = progress?.lectures || [];
    return new Map(entries.map((entry) => [String(entry.lectureId?._id || entry.lectureId), entry]));
  }, [progress?.lectures]);

  const lectureItems = useMemo(() => {
    return lectures.map((lecture, index) => {
      const lectureProgress = progressByLectureId.get(String(lecture._id));
      const previousLecture = lectures[index - 1];
      const previousProgress = previousLecture
        ? progressByLectureId.get(String(previousLecture._id))
        : null;
      const isUnlocked = index === 0 || Boolean(previousProgress?.quizCompleted);

      return {
        lecture,
        lectureProgress,
        isUnlocked,
        index,
      };
    });
  }, [lectures, progressByLectureId]);

  const nextRecommendedLecture =
    lectureItems.find((item) => item.isUnlocked && !item.lectureProgress?.quizCompleted) || lectureItems[0];

  useEffect(() => {
    if (!selectedLectureId && nextRecommendedLecture?.lecture?._id) {
      setSelectedLectureId(nextRecommendedLecture.lecture._id);
    }
  }, [nextRecommendedLecture, selectedLectureId]);

  const activeLecture =
    lectureItems.find((item) => item.lecture._id === selectedLectureId)?.lecture || nextRecommendedLecture?.lecture;
  const activeLectureProgress = activeLecture
    ? progressByLectureId.get(String(activeLecture._id))
    : null;
  const activeQuiz = quizData?.quiz;

  if (courseLoading || progressLoading) {
    return <p>Loading...</p>;
  }

  if (courseError || progressError || !course || !progress) {
    return <p>Failed to load course progress</p>;
  }

  const completedLectures = progress.completedLectures || 0;
  const completedQuizzes = progress.completedQuizzes || 0;
  const totalLectures = progress.totalLectures || lectures.length || 0;
  const averageQuizScore = progress.averageQuizScore || 0;
  const estimatedTotalMinutes = totalLectures * ESTIMATED_MINUTES_PER_LECTURE;
  const estimatedRemainingMinutes = Math.max(totalLectures - completedQuizzes, 0) * ESTIMATED_MINUTES_PER_LECTURE;

  const nextActionText = nextRecommendedLecture
    ? nextRecommendedLecture.lectureProgress?.watched && !nextRecommendedLecture.lectureProgress?.quizCompleted
      ? `Rinde el quiz de "${nextRecommendedLecture.lecture.lectureTitle}" para desbloquear el siguiente capítulo.`
      : `Continúa con "${nextRecommendedLecture.lecture.lectureTitle}".`
    : "Terminaste todas las actividades disponibles.";

  const selectLecture = async (lectureItem) => {
    if (!lectureItem.isUnlocked) {
      const previousLecture = lectures[lectureItem.index - 1];
      toast.error(`Debes aprobar el quiz de "${previousLecture?.lectureTitle}" antes de continuar.`);
      return;
    }

    setSelectedLectureId(lectureItem.lecture._id);
    setVideoError(false);
  };

  const handleLectureVideoEnded = async () => {
    if (!activeLecture || activeLectureProgress?.watched) {
      return;
    }

    try {
      await updateLectureProgress({ courseId, lectureId: activeLecture._id }).unwrap();
      refetch();
    } catch (error) {
      toast.error("No se pudo actualizar el progreso del capítulo.");
    }
  };

  const handleQuizComplete = (result) => {
    if (result?.passed) {
      toast.success("Quiz aprobado. El siguiente capítulo quedó desbloqueado.");
    } else {
      const minimumScore = activeQuiz?.passingScore || 70;
      toast.error(`No alcanzaste el puntaje mínimo. Necesitas ${minimumScore}% para avanzar.`);
    }
    refetch();
  };

  return (
    <div className="max-w-7xl mx-auto p-4 md:p-6">
      <div className="grid gap-6 lg:grid-cols-[1.45fr_0.85fr]">
        <div className="space-y-6">
          <Card className="border-slate-200/80 bg-white/90 shadow-sm">
            <CardHeader className="space-y-4">
              <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">
                    Ruta de aprendizaje
                  </p>
                  <CardTitle className="mt-2 text-2xl text-slate-900">{course.courseTitle}</CardTitle>
                  <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">{nextActionText}</p>
                </div>
                {progress.courseProgress === 100 && (
                  <Badge className="w-fit bg-emerald-600 text-white hover:bg-emerald-600">
                    <Award className="mr-2 h-4 w-4" /> Curso completado
                  </Badge>
                )}
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm text-slate-600">
                  <span>Progreso general</span>
                  <span className="font-semibold text-slate-900">{progress.courseProgress || 0}%</span>
                </div>
                <Progress value={progress.courseProgress || 0} className="h-2.5" />
              </div>

              <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                  <div className="flex items-center gap-2 text-slate-500">
                    <BookOpen className="h-4 w-4" /> Capítulos vistos
                  </div>
                  <p className="mt-3 text-2xl font-semibold text-slate-900">{completedLectures}/{totalLectures}</p>
                </div>
                <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                  <div className="flex items-center gap-2 text-slate-500">
                    <BookCheck className="h-4 w-4" /> Quizzes aprobados
                  </div>
                  <p className="mt-3 text-2xl font-semibold text-slate-900">{completedQuizzes}/{totalLectures}</p>
                </div>
                <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                  <div className="flex items-center gap-2 text-slate-500">
                    <Target className="h-4 w-4" /> Promedio quiz
                  </div>
                  <p className="mt-3 text-2xl font-semibold text-slate-900">{averageQuizScore}%</p>
                </div>
                <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                  <div className="flex items-center gap-2 text-slate-500">
                    <Clock3 className="h-4 w-4" /> Tiempo restante
                  </div>
                  <p className="mt-3 text-2xl font-semibold text-slate-900">~{estimatedRemainingMinutes} min</p>
                  <p className="mt-1 text-xs text-slate-500">Estimado total ~{estimatedTotalMinutes} min</p>
                </div>
              </div>
            </CardHeader>
          </Card>

          <Card className="border-slate-200/80 bg-white/90 shadow-sm">
            <CardContent className="p-5 md:p-6">
              <div className="overflow-hidden rounded-2xl border border-slate-200 bg-slate-100">
                {!activeLecture?.videoUrl ? (
                  <div className="flex aspect-video flex-col items-center justify-center gap-3 p-6 text-center">
                    <AlertTriangle className="h-10 w-10 text-amber-500" />
                    <p className="max-w-md text-sm text-slate-600">
                      Este capítulo no tiene un video configurado todavía. Puedes revisar la descripción y los materiales de apoyo mientras se carga el contenido.
                    </p>
                  </div>
                ) : videoError ? (
                  <div className="flex aspect-video flex-col items-center justify-center gap-3 p-6 text-center">
                    <AlertTriangle className="h-10 w-10 text-amber-500" />
                    <p className="max-w-md text-sm text-slate-600">
                      No se pudo reproducir este video. Puedes continuar con los materiales descargables y volver a intentar luego.
                    </p>
                    <Button variant="outline" onClick={() => setVideoError(false)}>Intentar de nuevo</Button>
                  </div>
                ) : (
                  <video
                    key={activeLecture?._id}
                    src={activeLecture?.videoUrl}
                    controls
                    controlsList="nodownload"
                    className="aspect-video w-full bg-black"
                    onContextMenu={(event) => event.preventDefault()}
                    onEnded={handleLectureVideoEnded}
                    onError={() => setVideoError(true)}
                  />
                )}
              </div>

              <div className="mt-5 flex flex-wrap items-start justify-between gap-4">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Capítulo activo</p>
                  <h2 className="mt-2 text-2xl font-semibold text-slate-900">{activeLecture?.lectureTitle}</h2>
                  {activeLecture?.lectureDescription && (
                    <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">{activeLecture.lectureDescription}</p>
                  )}
                </div>
                {activeLecture && (
                  <Badge variant="outline" className={getLectureStatus({ lecture: activeLecture, lectureProgress: activeLectureProgress, isUnlocked: true }).badgeClass}>
                    {getLectureStatus({ lecture: activeLecture, lectureProgress: activeLectureProgress, isUnlocked: true }).label}
                  </Badge>
                )}
              </div>

              {activeLecture?.supportMaterials?.length > 0 && (
                <div className="mt-5 rounded-2xl border border-slate-200 bg-slate-50 p-4">
                  <h3 className="font-semibold text-slate-900">Material de apoyo</h3>
                  <div className="mt-3 space-y-2">
                    {activeLecture.supportMaterials.map((material) => (
                      <a
                        key={material.url}
                        href={material.url}
                        target="_blank"
                        rel="noreferrer"
                        className="block rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-sky-700 hover:underline"
                      >
                        {material.name}
                      </a>
                    ))}
                  </div>
                </div>
              )}

              <div className="mt-6 rounded-2xl border border-slate-200 bg-slate-50 p-4 md:p-5">
                <div className="mb-4 flex items-start justify-between gap-4">
                  <div>
                    <h3 className="text-lg font-semibold text-slate-900">Evaluación del capítulo</h3>
                    <p className="mt-1 text-sm text-slate-600">
                      {`Necesitas al menos ${activeQuiz?.passingScore || 70}% para desbloquear el próximo capítulo.`}
                    </p>
                  </div>
                  {activeLectureProgress?.quizAttempts > 0 && (
                    <Badge variant="outline">
                      Intentos: {activeLectureProgress.quizAttempts}
                    </Badge>
                  )}
                </div>

                {!activeLectureProgress?.watched && (
                  <div className="mb-4 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
                    Aun no terminas el video de este capítulo. El quiz ya está disponible para que lo veas.
                  </div>
                )}

                {quizLoading ? (
                  <div className="rounded-2xl border border-slate-200 bg-white px-4 py-6 text-sm text-slate-600">
                    Cargando quiz...
                  </div>
                ) : quizLoadError ? (
                  <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-4 text-sm text-red-700">
                    <p>No se pudo cargar el quiz de este capítulo.</p>
                    <Button variant="outline" className="mt-3" onClick={() => refetchQuiz()}>
                      Reintentar
                    </Button>
                  </div>
                ) : activeQuiz ? (
                  <TakeQuiz quizId={activeQuiz._id} onQuizCompleted={handleQuizComplete} />
                ) : (
                  <div className="rounded-2xl border border-slate-200 bg-white px-4 py-4 text-sm text-slate-600">
                    Este capítulo no tiene un quiz configurado todavía.
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-4">
          <Card className="border-slate-200/80 bg-white/90 shadow-sm">
            <CardHeader>
              <CardTitle className="text-xl text-slate-900">Mapa del curso</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {lectureItems.map((item) => {
                const status = getLectureStatus(item);
                const isActive = item.lecture._id === activeLecture?._id;

                return (
                  <button
                    key={item.lecture._id}
                    type="button"
                    className={`w-full rounded-2xl border p-4 text-left transition ${
                      isActive
                        ? "border-slate-900 bg-slate-950 text-white"
                        : item.isUnlocked
                          ? "border-slate-200 bg-white hover:border-slate-300"
                          : "border-slate-200 bg-slate-50 opacity-75"
                    }`}
                    onClick={() => selectLecture(item)}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex min-w-0 items-start gap-3">
                        <span className={`mt-0.5 rounded-full p-2 ${isActive ? "bg-white/10" : "bg-slate-100"}`}>
                          {!item.isUnlocked ? (
                            <Lock className={`h-4 w-4 ${isActive ? "text-white" : "text-slate-500"}`} />
                          ) : item.lectureProgress?.quizCompleted ? (
                            <CheckCircle2 className={`h-4 w-4 ${isActive ? "text-emerald-300" : "text-emerald-600"}`} />
                          ) : (
                            <CirclePlay className={`h-4 w-4 ${isActive ? "text-white" : "text-slate-500"}`} />
                          )}
                        </span>
                        <div className="min-w-0">
                          <p className={`font-semibold ${isActive ? "text-white" : "text-slate-900"}`}>
                            {item.index + 1}. {item.lecture.lectureTitle}
                          </p>
                          {item.lecture.lectureDescription && (
                            <p className={`mt-1 text-sm leading-6 ${isActive ? "text-slate-300" : "text-slate-600"}`}>
                              {item.lecture.lectureDescription}
                            </p>
                          )}
                        </div>
                      </div>
                      <Badge variant="outline" className={isActive ? "border-white/20 text-white" : status.badgeClass}>
                        {status.label}
                      </Badge>
                    </div>
                  </button>
                );
              })}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default CourseProgress;