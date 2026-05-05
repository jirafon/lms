import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { useGetQuizByLectureQuery, useDeleteQuizMutation } from '@/features/api/quizApi';
import { Edit, Trash2, Plus, Eye, Users } from 'lucide-react';
import { toast } from 'sonner';
import { useTranslation } from 'react-i18next';
import CreateQuiz from './CreateQuiz';
import EditQuiz from './EditQuiz';

const QuizManager = ({ courseId, lectureId, lectureName }) => {
  const { t } = useTranslation();
  const [mode, setMode] = useState('view'); // 'view', 'create', 'edit'
  const [selectedQuiz, setSelectedQuiz] = useState(null);

  const { data: quizData, isLoading, error, refetch } = useGetQuizByLectureQuery(lectureId);
  const [deleteQuiz, { isLoading: isDeleting }] = useDeleteQuizMutation();

  const quiz = quizData?.quiz;

  const handleDeleteQuiz = async () => {
    if (!quiz) return;
    
    const confirmed = window.confirm(t('quiz.confirm_delete_quiz'));
    if (!confirmed) return;

    try {
      await deleteQuiz(quiz._id).unwrap();
      toast.success(t('quiz.quiz_deleted_successfully'));
      refetch();
      setMode('view');
    } catch (error) {
      toast.error(t('quiz.error_deleting_quiz') + ': ' + (error.data?.message || t('messages.unknown_error')));
    }
  };

  const handleEditQuiz = () => {
    setSelectedQuiz(quiz);
    setMode('edit');
  };

  const handleCreateQuiz = () => {
    setSelectedQuiz(null);
    setMode('create');
  };

  const handleQuizCreated = () => {
    refetch();
    setMode('view');
    toast.success(t('quiz.quiz_created_successfully'));
  };

  const handleQuizUpdated = () => {
    refetch();
    setMode('view');
    setSelectedQuiz(null);
    toast.success(t('quiz.quiz_updated_successfully'));
  };

  const handleCancel = () => {
    setMode('view');
    setSelectedQuiz(null);
  };

  if (isLoading) {
    return <div className="p-4">Cargando quiz...</div>;
  }

  // Render create quiz form
  if (mode === 'create') {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">Crear Quiz para: {lectureName}</h3>
          <Button variant="outline" onClick={handleCancel}>
            Cancelar
          </Button>
        </div>
        <CreateQuiz 
          courseId={courseId} 
          lectureId={lectureId} 
          onQuizCreated={handleQuizCreated}
        />
      </div>
    );
  }

  // Render edit quiz form
  if (mode === 'edit' && selectedQuiz) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">Editar Quiz: {selectedQuiz.title}</h3>
          <Button variant="outline" onClick={handleCancel}>
            Cancelar
          </Button>
        </div>
        <EditQuiz 
          quiz={selectedQuiz}
          onQuizUpdated={handleQuizUpdated}
          onCancel={handleCancel}
        />
      </div>
    );
  }

  // Render quiz view/management
  return (
    <Card className="mt-6">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Quiz Management
          </CardTitle>
          {!quiz && (
            <Button onClick={handleCreateQuiz} className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              Crear Quiz
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {error && (
          <div className="text-red-500 mb-4">
            Error: {error.data?.message || 'Error al cargar quiz'}
          </div>
        )}

        {!quiz ? (
          <div className="text-center py-8">
            <div className="text-gray-500 mb-4">
              No hay quiz para esta lectura
            </div>
            <Button onClick={handleCreateQuiz} variant="outline">
              <Plus className="h-4 w-4 mr-2" />
              Crear primer quiz
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Quiz Info */}
            <div className="border rounded-lg p-4 bg-gray-50 dark:bg-gray-900">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h4 className="font-semibold text-lg">{quiz.title}</h4>
                  {quiz.description && (
                    <p className="text-gray-600 text-sm">{quiz.description}</p>
                  )}
                </div>
                <div className="flex gap-2">
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={handleEditQuiz}
                    className="flex items-center gap-1"
                  >
                    <Edit className="h-4 w-4" />
                    Editar
                  </Button>
                  <Button 
                    variant="destructive" 
                    size="sm"
                    onClick={handleDeleteQuiz}
                    disabled={isDeleting}
                    className="flex items-center gap-1"
                  >
                    <Trash2 className="h-4 w-4" />
                    {isDeleting ? 'Eliminando...' : 'Eliminar'}
                  </Button>
                </div>
              </div>

              {/* Quiz Stats */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">{quiz.questions?.length || 0}</div>
                  <div className="text-sm text-gray-600">Preguntas</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">{quiz.timeLimit || 0}</div>
                  <div className="text-sm text-gray-600">Minutos</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-600">{quiz.passingScore || 70}%</div>
                  <div className="text-sm text-gray-600">Nota mínima</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-orange-600">{quiz.maxAttempts || 3}</div>
                  <div className="text-sm text-gray-600">Intentos máx.</div>
                </div>
              </div>
            </div>

            {/* Questions Preview */}
            <div>
              <h5 className="font-medium mb-3">Preguntas ({quiz.questions?.length || 0}):</h5>
              <div className="space-y-2 max-h-60 overflow-y-auto">
                {quiz.questions?.map((question, index) => (
                  <div key={index} className="border rounded p-3 bg-white dark:bg-gray-800">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <p className="font-medium">
                          {index + 1}. {question.question}
                        </p>
                        <div className="mt-2 space-y-1">
                          {question.options?.map((option, optIndex) => (
                            <div 
                              key={optIndex} 
                              className={`text-sm px-2 py-1 rounded ${
                                option.isCorrect 
                                  ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' 
                                  : 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300'
                              }`}
                            >
                              {String.fromCharCode(65 + optIndex)}. {option.text}
                              {option.isCorrect && (
                                <Badge variant="secondary" className="ml-2">Correcta</Badge>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                      <Badge variant="outline">{question.points || 1} pts</Badge>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default QuizManager;