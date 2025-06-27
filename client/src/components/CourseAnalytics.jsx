import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Progress } from './ui/progress';
import { BarChart3, Users, BookOpen, Target } from 'lucide-react';
import { useGetCourseProgressQuery } from '@/features/api/courseProgressApi';

const CourseAnalytics = ({ courseId }) => {
  const { data: progressData, isLoading, error } = useGetCourseProgressQuery(courseId);

  if (isLoading) {
    return (
      <Card className="max-w-4xl mx-auto mt-8">
        <CardContent className="p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-gray-200 rounded w-1/3"></div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[1, 2, 3, 4].map(i => (
                <div key={i} className="h-20 bg-gray-200 rounded"></div>
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
            <p>Error al cargar las estadísticas del curso</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const analytics = progressData?.analytics || {};
  const {
    totalStudents = 0,
    activeStudents = 0,
    completedStudents = 0,
    averageScore = 0,
    averageCompletionTime = 0,
    quizPassRate = 0
  } = analytics;

  return (
    <Card className="max-w-4xl mx-auto mt-8">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <BarChart3 className="h-6 w-6" />
          Estadísticas del Curso
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Key Metrics */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center p-4 bg-blue-50 rounded-lg">
            <Users className="h-8 w-8 mx-auto text-blue-600 mb-2" />
            <div className="text-2xl font-bold text-blue-600">{totalStudents}</div>
            <div className="text-sm text-gray-600">Total Estudiantes</div>
          </div>
          
          <div className="text-center p-4 bg-green-50 rounded-lg">
            <BookOpen className="h-8 w-8 mx-auto text-green-600 mb-2" />
            <div className="text-2xl font-bold text-green-600">{activeStudents}</div>
            <div className="text-sm text-gray-600">Estudiantes Activos</div>
          </div>
          
          <div className="text-center p-4 bg-purple-50 rounded-lg">
            <Target className="h-8 w-8 mx-auto text-purple-600 mb-2" />
            <div className="text-2xl font-bold text-purple-600">{completedStudents}</div>
            <div className="text-sm text-gray-600">Completaron</div>
          </div>
          
          <div className="text-center p-4 bg-orange-50 rounded-lg">
            <BarChart3 className="h-8 w-8 mx-auto text-orange-600 mb-2" />
            <div className="text-2xl font-bold text-orange-600">{Math.round(averageScore)}%</div>
            <div className="text-sm text-gray-600">Puntaje Promedio</div>
          </div>
        </div>

        {/* Progress Bars */}
        <div className="space-y-4">
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Tasa de Aprobación de Quizzes</span>
              <span>{Math.round(quizPassRate)}%</span>
            </div>
            <Progress value={quizPassRate} className="h-3" />
          </div>

          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Tasa de Finalización</span>
              <span>{totalStudents > 0 ? Math.round((completedStudents / totalStudents) * 100) : 0}%</span>
            </div>
            <Progress 
              value={totalStudents > 0 ? (completedStudents / totalStudents) * 100 : 0} 
              className="h-3" 
            />
          </div>
        </div>

        {/* Additional Stats */}
        {averageCompletionTime > 0 && (
          <div className="text-center p-4 bg-gray-50 rounded-lg">
            <div className="text-lg font-semibold text-gray-700">
              Tiempo Promedio de Finalización
            </div>
            <div className="text-2xl font-bold text-gray-900">
              {Math.round(averageCompletionTime)} días
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default CourseAnalytics; 