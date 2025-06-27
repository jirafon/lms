import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Progress } from './ui/progress';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { 
  CheckCircle, 
  Clock, 
  Play, 
  BookOpen, 
  Award,
  Calendar,
  Target
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useGetCourseProgressQuery } from '@/features/api/courseProgressApi';

const CourseProgress = ({ courseId }) => {
  const { t } = useTranslation();
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
  const {
    courseId: progressCourseId,
    courseTitle,
    totalLectures,
    completedLectures,
    totalQuizzes,
    passedQuizzes,
    currentLecture,
    lastAccessed,
    estimatedCompletion,
    certificates,
    timeSpent
  } = progress;

  const progressPercentage = Math.round((completedLectures / totalLectures) * 100);
  const quizProgressPercentage = totalQuizzes > 0 ? Math.round((passedQuizzes / totalQuizzes) * 100) : 0;

  const getProgressStatus = (percentage) => {
    if (percentage >= 100) return { color: 'bg-green-100 text-green-800', icon: Award, text: t('progress.completed') };
    if (percentage >= 75) return { color: 'bg-blue-100 text-blue-800', icon: Target, text: t('progress.almost_done') };
    if (percentage >= 50) return { color: 'bg-yellow-100 text-yellow-800', icon: Clock, text: t('progress.halfway') };
    return { color: 'bg-gray-100 text-gray-800', icon: Play, text: t('progress.just_started') };
  };

  const progressStatus = getProgressStatus(progressPercentage);

  const formatTime = (minutes) => {
    if (minutes < 60) return `${minutes} ${t('progress.minutes')}`;
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    return `${hours} ${t('progress.hours')} ${remainingMinutes} ${t('progress.minutes')}`;
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString();
  };

  return (
    <div className="space-y-6">
      {/* Course Overview */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <BookOpen className="h-5 w-5" />
                {courseTitle}
              </CardTitle>
              <p className="text-sm text-gray-600 mt-1">{t('progress.course_progress')}</p>
            </div>
            <Badge className={progressStatus.color}>
              <progressStatus.icon className="h-3 w-3 mr-1" />
              {progressStatus.text}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Main Progress */}
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium">{t('progress.lecture_progress')}</span>
              <span className="text-sm text-gray-600">{completedLectures}/{totalLectures}</span>
            </div>
            <Progress value={progressPercentage} className="h-3" />
            <div className="text-sm text-gray-600">
              {t('progress.progress_percentage', { percentage: progressPercentage })}
            </div>
          </div>

          {/* Quiz Progress */}
          {totalQuizzes > 0 && (
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">{t('progress.quiz_progress')}</span>
                <span className="text-sm text-gray-600">{passedQuizzes}/{totalQuizzes}</span>
              </div>
              <Progress value={quizProgressPercentage} className="h-2" />
              <div className="text-sm text-gray-600">
                {t('progress.quiz_percentage', { percentage: quizProgressPercentage })}
              </div>
            </div>
          )}

          {/* Stats Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4 border-t">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{completedLectures}</div>
              <div className="text-xs text-gray-600">{t('progress.completed_lectures')}</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{passedQuizzes}</div>
              <div className="text-xs text-gray-600">{t('progress.passed_quizzes')}</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">{formatTime(timeSpent)}</div>
              <div className="text-xs text-gray-600">{t('progress.time_spent')}</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600">{certificates?.length || 0}</div>
              <div className="text-xs text-gray-600">{t('progress.certificates')}</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Current Status */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-sm">
              <Play className="h-4 w-4" />
              {t('progress.current_lecture')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {currentLecture ? (
              <div className="space-y-2">
                <p className="font-medium">{currentLecture.title}</p>
                <p className="text-sm text-gray-600">{t('progress.lecture_number', { number: currentLecture.order })}</p>
                <Button size="sm">
                  {t('progress.continue_learning')}
                </Button>
              </div>
            ) : (
              <p className="text-gray-500">{t('progress.no_current_lecture')}</p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-sm">
              <Calendar className="h-4 w-4" />
              {t('progress.learning_activity')}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div>
              <p className="text-sm text-gray-600">{t('progress.last_accessed')}</p>
              <p className="font-medium">{formatDate(lastAccessed)}</p>
            </div>
            {estimatedCompletion && (
              <div>
                <p className="text-sm text-gray-600">{t('progress.estimated_completion')}</p>
                <p className="font-medium">{formatDate(estimatedCompletion)}</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Certificates */}
      {certificates && certificates.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Award className="h-5 w-5" />
              {t('progress.achieved_certificates')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {certificates.map((certificate, index) => (
                <div key={index} className="flex items-center gap-3 p-3 bg-green-50 rounded-lg border border-green-200">
                  <Award className="h-8 w-8 text-green-600" />
                  <div>
                    <p className="font-medium">{certificate.title}</p>
                    <p className="text-sm text-gray-600">{formatDate(certificate.issuedDate)}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Action Buttons */}
      <div className="flex justify-center">
        <Button size="lg">
          <Play className="h-4 w-4 mr-2" />
          {progressPercentage >= 100 ? t('progress.review_course') : t('progress.continue_learning')}
        </Button>
      </div>
    </div>
  );
};

export default CourseProgress; 