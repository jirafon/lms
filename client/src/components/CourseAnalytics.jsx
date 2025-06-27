import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Progress } from './ui/progress';
import { Badge } from './ui/badge';
import { 
  BarChart3, 
  Users, 
  BookOpen, 
  Clock, 
  TrendingUp, 
  Award,
  CheckCircle,
  XCircle,
  AlertCircle
} from 'lucide-react';
import { useTranslation } from 'react-i18next';

const CourseAnalytics = ({ analytics }) => {
  const { t } = useTranslation();
  
  if (!analytics) {
    return (
      <div className="text-center py-8">
        <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
        <p className="text-gray-500">{t('analytics.no_data_available')}</p>
      </div>
    );
  }

  const {
    totalStudents,
    activeStudents,
    completionRate,
    averageScore,
    totalLectures,
    completedLectures,
    averageTimeSpent,
    quizStats,
    recentActivity
  } = analytics;

  const getCompletionStatus = (rate) => {
    if (rate >= 80) return { color: 'bg-green-100 text-green-800', icon: CheckCircle };
    if (rate >= 60) return { color: 'bg-yellow-100 text-yellow-800', icon: AlertCircle };
    return { color: 'bg-red-100 text-red-800', icon: XCircle };
  };

  const completionStatus = getCompletionStatus(completionRate);

  return (
    <div className="space-y-6">
      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">{t('analytics.total_students')}</p>
                <p className="text-2xl font-bold">{totalStudents}</p>
              </div>
              <Users className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">{t('analytics.active_students')}</p>
                <p className="text-2xl font-bold">{activeStudents}</p>
              </div>
              <TrendingUp className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">{t('analytics.completion_rate')}</p>
                <p className="text-2xl font-bold">{completionRate}%</p>
              </div>
              <Award className="h-8 w-8 text-purple-500" />
            </div>
            <div className="mt-2">
              <Badge className={completionStatus.color}>
                <completionStatus.icon className="h-3 w-3 mr-1" />
                {completionRate >= 80 ? t('analytics.excellent') : 
                 completionRate >= 60 ? t('analytics.good') : t('analytics.needs_improvement')}
              </Badge>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">{t('analytics.average_score')}</p>
                <p className="text-2xl font-bold">{averageScore}%</p>
              </div>
              <BarChart3 className="h-8 w-8 text-orange-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Progress Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BookOpen className="h-5 w-5" />
              {t('analytics.lecture_progress')}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium">{t('analytics.completed_lectures')}</span>
              <span className="text-sm text-gray-600">{completedLectures}/{totalLectures}</span>
            </div>
            <Progress value={(completedLectures / totalLectures) * 100} className="h-2" />
            <div className="text-sm text-gray-600">
              {t('analytics.progress_percentage', { 
                percentage: Math.round((completedLectures / totalLectures) * 100) 
              })}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              {t('analytics.time_analytics')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-blue-600">
              {Math.round(averageTimeSpent / 60)} {t('analytics.minutes')}
            </div>
            <p className="text-sm text-gray-600 mt-1">{t('analytics.average_time_per_student')}</p>
          </CardContent>
        </Card>
      </div>

      {/* Quiz Statistics */}
      {quizStats && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              {t('analytics.quiz_statistics')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center p-4 bg-green-50 rounded-lg">
                <div className="text-2xl font-bold text-green-600">{quizStats.passedQuizzes}</div>
                <div className="text-sm text-green-700">{t('analytics.passed_quizzes')}</div>
              </div>
              <div className="text-center p-4 bg-blue-50 rounded-lg">
                <div className="text-2xl font-bold text-blue-600">{quizStats.averageQuizScore}%</div>
                <div className="text-sm text-blue-700">{t('analytics.average_quiz_score')}</div>
              </div>
              <div className="text-center p-4 bg-purple-50 rounded-lg">
                <div className="text-2xl font-bold text-purple-600">{quizStats.totalAttempts}</div>
                <div className="text-sm text-purple-700">{t('analytics.total_attempts')}</div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Recent Activity */}
      {recentActivity && recentActivity.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>{t('analytics.recent_activity')}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {recentActivity.map((activity, index) => (
                <div key={index} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  <div className="flex-1">
                    <p className="text-sm font-medium">{activity.studentName}</p>
                    <p className="text-xs text-gray-600">{activity.action}</p>
                  </div>
                  <span className="text-xs text-gray-500">{activity.timestamp}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default CourseAnalytics; 