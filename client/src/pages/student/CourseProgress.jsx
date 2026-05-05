import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import {
  useCompleteCourseMutation,
  useGetCourseProgressQuery,
  useInCompleteCourseMutation,
  useUpdateLectureProgressMutation,
} from "@/features/api/courseProgressApi";
import { CheckCircle, CheckCircle2, CirclePlay, Lock, AlertTriangle, Award, TrendingUp } from "lucide-react";
import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { toast } from "sonner";
import TakeQuiz from "@/components/TakeQuiz";
import { useGetQuizByLectureQuery } from "@/features/api/quizApi";

const CourseProgress = () => {
  const params = useParams();
  const courseId = params.courseId;
  const { data, isLoading, isError, refetch } =
    useGetCourseProgressQuery(courseId);

  const [updateLectureProgress] = useUpdateLectureProgressMutation();
  const [
    completeCourse,
    { data: markCompleteData, isSuccess: completedSuccess },
  ] = useCompleteCourseMutation();
  const [
    inCompleteCourse,
    { data: markInCompleteData, isSuccess: inCompletedSuccess },
  ] = useInCompleteCourseMutation();

  const [videoError, setVideoError] = useState(false);
  const [selectedLectureId, setSelectedLectureId] = useState(null);
  const [showQuiz, setShowQuiz] = useState(false);
  
  // Get quiz for selected lecture
  const { data: quizData } = useGetQuizByLectureQuery(selectedLectureId, {
    skip: !selectedLectureId
  });

  useEffect(() => {
    console.log(markCompleteData);

    if (completedSuccess) {
      refetch();
      toast.success(markCompleteData.message);
    }
    if (inCompletedSuccess) {
      refetch();
      toast.success(markInCompleteData.message);
    }
  }, [completedSuccess, inCompletedSuccess]);

  const [currentLecture, setCurrentLecture] = useState(null);

  if (isLoading) return <p>Loading...</p>;
  if (isError) return <p>Failed to load course details</p>;

  console.log(data);

  const { courseDetails, progress, completed } = data.data;
  const { courseTitle } = courseDetails;

  // Calculate progress stats
  const totalLectures = courseDetails.lectures?.length || 0;
  const completedLectures = progress.filter(prog => prog.viewed).length;
  const completedQuizzes = progress.filter(prog => prog.quizCompleted).length;
  const overallProgress = totalLectures > 0 ? Math.round((completedQuizzes / totalLectures) * 100) : 0;

  // Debug logging for video URLs
  console.log("🎥 CourseProgress video data:", {
    courseTitle,
    totalLectures: courseDetails.lectures?.length,
    firstLectureVideoUrl: courseDetails.lectures?.[0]?.videoUrl,
    currentLectureVideoUrl: currentLecture?.videoUrl,
    initialLectureVideoUrl: initialLecture?.videoUrl
  });

  // initialze the first lecture is not exist
  const initialLecture =
    currentLecture || (courseDetails.lectures && courseDetails.lectures[0]);
  const activeLecture = currentLecture || initialLecture;

  const isLectureCompleted = (lectureId) => {
    return progress.some((prog) => prog.lectureId === lectureId && prog.viewed);
  };

  const isQuizCompleted = (lectureId) => {
    // Check progress for quiz completion
    const lectureProgress = progress.find((prog) => prog.lectureId === lectureId);
    return lectureProgress?.quizCompleted || false;
  };

  const isLectureUnlocked = (lectureIndex) => {
    // First lecture is always unlocked
    if (lectureIndex === 0) return true;
    
    // For subsequent lectures, check if previous lecture's quiz is completed
    const previousLectureId = courseDetails.lectures[lectureIndex - 1]._id;
    return isQuizCompleted(previousLectureId);
  };

  const handleLectureProgress = async (lectureId) => {
    await updateLectureProgress({ courseId, lectureId });
    refetch();
  };
  // Handle select a specific lecture to watch
  const handleSelectLecture = (lecture, lectureIndex) => {
    if (!isLectureUnlocked(lectureIndex)) {
      const previousLecture = courseDetails.lectures[lectureIndex - 1];
      toast.error(`Debes completar y aprobar el quiz de "${previousLecture.lectureTitle}" antes de acceder a esta lectura.`);
      return;
    }
    
    setCurrentLecture(lecture);
    setSelectedLectureId(lecture._id);
    handleLectureProgress(lecture._id);
  };

  const handleQuizComplete = (results) => {
    if (results.passed) {
      toast.success('¡Quiz aprobado! Ya puedes acceder a la siguiente lectura.');
      refetch(); // Refresh progress data
    } else {
      toast.error(`Quiz no aprobado. Necesitas ${quiz?.passingScore || 70}% para continuar.`);
    }
    setShowQuiz(false);
  };

  const handleVideoError = () => {
    setVideoError(true);
  };

  const handleCompleteCourse = async () => {
    await completeCourse(courseId);
  };
  const handleInCompleteCourse = async () => {
    await inCompleteCourse(courseId);
  };

  return (
    <div className="max-w-7xl mx-auto p-4">
      {/* Display course name  */}
      <div className="flex justify-between mb-4">
        <h1 className="text-2xl font-bold">{courseTitle}</h1>
        <Button
          onClick={completed ? handleInCompleteCourse : handleCompleteCourse}
          variant={completed ? "outline" : "default"}
        >
          {completed ? (
            <div className="flex items-center">
              <CheckCircle className="h-4 w-4 mr-2" /> <span>Completed</span>{" "}
            </div>
          ) : (
            "Mark as completed"
          )}
        </Button>
      </div>

      {/* Progress Bar Section */}
      <Card className="mb-6">
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-blue-600" />
              <h2 className="text-xl font-semibold">Progreso del Curso</h2>
            </div>
            {overallProgress === 100 && (
              <div className="flex items-center gap-2 text-green-600">
                <Award className="h-5 w-5" />
                <span className="font-medium">¡Curso Completado!</span>
              </div>
            )}
          </div>
          
          {/* Progress Bar */}
          <div className="mb-4">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm text-gray-600">Progreso General</span>
              <span className="text-sm font-medium">{overallProgress}%</span>
            </div>
            <Progress 
              value={overallProgress} 
              className="h-2.5 transition-all duration-300 ease-in-out" 
            />
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-center gap-3 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
              <div className="p-2 bg-blue-100 dark:bg-blue-800 rounded-full">
                <CirclePlay className="h-4 w-4 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Lecturas Vistas</p>
                <p className="font-semibold">{completedLectures} de {totalLectures}</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3 p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
              <div className="p-2 bg-green-100 dark:bg-green-800 rounded-full">
                <CheckCircle2 className="h-4 w-4 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Quizzes Aprobados</p>
                <p className="font-semibold">{completedQuizzes} de {totalLectures}</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3 p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
              <div className="p-2 bg-purple-100 dark:bg-purple-800 rounded-full">
                <Lock className="h-4 w-4 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Siguiente Disponible</p>
                <p className="font-semibold">
                  {overallProgress === 100 ? "¡Todas completadas!" : 
                   completedQuizzes < totalLectures ? `Capítulo ${completedQuizzes + 1}` : "Ninguna"}
                </p>
              </div>
            </div>
          </div>
          
          {/* Completion Message */}
          {overallProgress === 100 && (
            <div className="mt-4 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <Award className="h-5 w-5 text-green-600" />
                <span className="font-medium text-green-800 dark:text-green-400">¡Felicitaciones!</span>
              </div>
              <p className="text-sm text-green-700 dark:text-green-300">
                Has completado exitosamente todos los capítulos y quizzes del curso de Privacidad de Datos. 
                ¡Ya puedes solicitar tu certificado!
              </p>
            </div>
          )}
          
          {/* Next Action */}
          {overallProgress < 100 && (
            <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
              <p className="text-sm text-blue-700 dark:text-blue-300">
                <strong>Próximo paso:</strong> {' '}
                {completedQuizzes < totalLectures ? 
                  `Completa el quiz del Capítulo ${completedQuizzes + 1} para desbloquear el siguiente contenido.` :
                  "Completa las lecturas pendientes para continuar con tu progreso."
                }
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      <div className="flex flex-col md:flex-row gap-6">
        {/* Video section  */}
        <div className="flex-1 md:w-3/5 h-fit rounded-lg shadow-lg p-4">
          <div>
            {videoError ? (
              <div className="w-full h-64 bg-gray-100 dark:bg-gray-800 rounded-lg flex flex-col items-center justify-center p-6">
                <AlertTriangle className="h-12 w-12 text-yellow-500 mb-4" />
                <h3 className="text-lg font-semibold mb-2">Video no disponible</h3>
                <p className="text-sm text-gray-600 text-center mb-4">
                  El video no se puede reproducir porque la configuración de S3 no está completa en Render.
                </p>
                <div className="text-xs text-gray-500 text-center">
                  <p>Para solucionarlo:</p>
                  <p>1. Configura las variables de entorno de S3 en Render</p>
                  <p>2. O contacta al administrador</p>
                </div>
                <Button 
                  variant="outline" 
                  className="mt-4"
                  onClick={() => setVideoError(false)}
                >
                  Intentar de nuevo
                </Button>
              </div>
            ) : (
              <video
                src={activeLecture?.videoUrl}
                controls
                className="w-full h-auto md:rounded-lg"
                onPlay={() =>
                  handleLectureProgress(activeLecture?._id)
                }
                onError={handleVideoError}
              />
            )}
          </div>
          {/* Display current watching lecture title */}
          <div className="mt-2 ">
            <h3 className="font-medium text-lg">
              {`Lecture ${
                courseDetails.lectures.findIndex(
                  (lec) => lec._id === activeLecture?._id
                ) + 1
              } : ${activeLecture?.lectureTitle}`}
            </h3>
            {activeLecture?.lectureDescription && (
              <p className="mt-2 text-sm text-gray-600 dark:text-gray-300">
                {activeLecture.lectureDescription}
              </p>
            )}
          </div>
          {activeLecture?.supportMaterials?.length > 0 && (
            <div className="mt-4 rounded-lg border p-4">
              <h4 className="font-semibold">Downloadable files</h4>
              <div className="mt-3 space-y-2">
                {activeLecture.supportMaterials.map((material) => (
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
          )}
        </div>
        {/* Lecture Sidebar  */}
        <div className="flex flex-col w-full md:w-2/5 border-t md:border-t-0 md:border-l border-gray-200 md:pl-4 pt-4 md:pt-0">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-xl">Lecturas del Curso</h2>
            <Badge variant="outline" className="text-xs">
              {completedQuizzes}/{totalLectures} completadas
            </Badge>
          </div>
          <div className="flex-1 overflow-y-auto">
            {courseDetails?.lectures.map((lecture, index) => {
              const isUnlocked = isLectureUnlocked(index);
              const isCompleted = isLectureCompleted(lecture._id);
              const hasQuizCompleted = isQuizCompleted(lecture._id);
              
              return (
                <Card
                  key={lecture._id}
                  className={`mb-3 transition transform ${
                    !isUnlocked 
                      ? "opacity-50 cursor-not-allowed" 
                      : "hover:cursor-pointer"
                  } ${
                    lecture._id === currentLecture?._id
                      ? "bg-gray-200 dark:bg-gray-800"
                      : ""
                  }`}
                  onClick={() => isUnlocked && handleSelectLecture(lecture, index)}
                >
                  <CardContent className="flex items-center justify-between p-4">
                    <div className="flex items-center flex-1">
                      {!isUnlocked ? (
                        <Lock size={24} className="text-gray-400 mr-2" />
                      ) : isCompleted ? (
                        <CheckCircle2 size={24} className="text-green-500 mr-2" />
                      ) : (
                        <CirclePlay size={24} className="text-gray-500 mr-2" />
                      )}
                      <div className="flex-1">
                        <CardTitle className={`text-lg font-medium ${
                          !isUnlocked ? "text-gray-400" : ""
                        }`}>
                          {lecture.lectureTitle}
                        </CardTitle>
                        {lecture.lectureDescription && (
                          <p className={`mt-1 text-sm ${
                            !isUnlocked ? "text-gray-400" : "text-gray-600 dark:text-gray-300"
                          }`}>
                            {lecture.lectureDescription}
                          </p>
                        )}
                        {!isUnlocked && index > 0 && (
                          <p className="text-sm text-gray-500 mt-1">
                            Completa el quiz anterior para desbloquear
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      {isCompleted && (
                        <Badge variant="outline" className="bg-green-200 text-green-600">
                          Completada
                        </Badge>
                      )}
                      {hasQuizCompleted && (
                        <Badge variant="outline" className="bg-blue-200 text-blue-600">
                          Quiz aprobado
                        </Badge>
                      )}
                      {isUnlocked && quizData?.quiz && !hasQuizCompleted && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={(e) => {
                            e.stopPropagation();
                            setShowQuiz(true);
                          }}
                        >
                          Realizar Quiz
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </div>
      
      {/* Quiz Modal */}
      {showQuiz && quizData?.quiz && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-semibold">Quiz: {quizData.quiz.title}</h3>
                <Button
                  variant="outline"
                  onClick={() => setShowQuiz(false)}
                >
                  Cerrar
                </Button>
              </div>
              <TakeQuiz
                quizId={quizData.quiz._id}
                onQuizCompleted={handleQuizComplete}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CourseProgress;
