import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Progress } from './ui/progress';
import { Button } from './ui/button';
import { CheckCircle, PlayCircle, Lock } from 'lucide-react';
import { useGetCourseProgressQuery } from '@/features/api/courseProgressApi';

const CourseProgress = ({ courseId }) => {
  const { data: progressData, isLoading, error } = useGetCourseProgressQuery(courseId);

  if (isLoading) {
    return (
      <Card className="max-w-4xl mx-auto mt-8">
        <CardContent className="p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-gray-200 rounded w-1/3"></div>
            <div className="space-y-2">
              {[1, 2, 3].map(i => (
                <div key={i} className="h-16 bg-gray-200 rounded"></div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="max-w-4xl mx-auto mt-8">
        <CardContent className="p-6">
          <div className="text-center text-red-500">
            <p>Error al cargar el progreso del curso</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const progress = progressData?.progress || {};
  const { completedLectures = 0, totalLectures = 0, completedQuizzes = 0, totalQuizzes = 0 } = progress;
  const lectureProgress = totalLectures > 0 ? (completedLectures / totalLectures) * 100 : 0;
  const quizProgress = totalQuizzes > 0 ? (completedQuizzes / totalQuizzes) * 100 : 0;
  const overallProgress = totalLectures + totalQuizzes > 0 ? 
    ((completedLectures + completedQuizzes) / (totalLectures + totalQuizzes)) * 100 : 0;

  return (
    <Card className="max-w-4xl mx-auto mt-8">
      <CardHeader>
        <CardTitle>Progreso del Curso</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Overall Progress */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>Progreso General</span>
            <span>{Math.round(overallProgress)}%</span>
          </div>
          <Progress value={overallProgress} className="h-3" />
        </div>

        {/* Lecture Progress */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>Lecciones Completadas</span>
            <span>{completedLectures}/{totalLectures}</span>
          </div>
          <Progress value={lectureProgress} className="h-2" />
        </div>

        {/* Quiz Progress */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>Quizzes Completados</span>
            <span>{completedQuizzes}/{totalQuizzes}</span>
          </div>
          <Progress value={quizProgress} className="h-2" />
        </div>

        {/* Statistics */}
        <div className="grid grid-cols-2 gap-4 pt-4">
          <div className="text-center p-4 bg-gray-50 rounded-lg">
            <div className="text-2xl font-bold text-blue-600">{completedLectures}</div>
            <div className="text-sm text-gray-600">Lecciones Completadas</div>
          </div>
          <div className="text-center p-4 bg-gray-50 rounded-lg">
            <div className="text-2xl font-bold text-green-600">{completedQuizzes}</div>
            <div className="text-sm text-gray-600">Quizzes Completados</div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default CourseProgress; 