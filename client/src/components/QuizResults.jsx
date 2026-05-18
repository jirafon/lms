import React from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { CheckCircle, XCircle, AlertCircle, Clock, Trophy, RefreshCw, Target, Bot } from 'lucide-react';
import { Skeleton } from './ui/skeleton';
import { useGetQuizResultsQuery } from '@/features/api/quizApi';
import { useTranslation } from 'react-i18next';
import { Progress } from './ui/progress';
import { Alert, AlertDescription } from './ui/alert';

const buildExplainErrorsPrompt = ({ score, questions }) => {
  const incorrectQuestions = questions.filter((question) => !question.userAnswer?.isCorrect);
  if (!incorrectQuestions.length) {
    return 'Repasame los puntos clave de este quiz y como consolidar lo aprendido.';
  }

  const errorDetails = incorrectQuestions
    .map((question, index) => {
      const userAnswer = question.userAnswer?.textAnswer || question.userAnswer?.selectedOptions?.join(', ') || 'Sin respuesta';
      const correctAnswer = Array.isArray(question.correctAnswer)
        ? question.correctAnswer.join(', ')
        : question.correctAnswer;

      return [
        `${index + 1}. Pregunta: ${question.question}`,
        `Mi respuesta: ${userAnswer}`,
        `Respuesta correcta: ${correctAnswer}`,
        question.explanation ? `Explicacion disponible: ${question.explanation}` : null,
      ]
        .filter(Boolean)
        .join('\n');
    })
    .join('\n\n');

  return [
    `Explicame mis errores en este quiz. Obtuve ${score}%.`,
    'Quiero que me expliques por que falle cada una, que patron de error ves y como evitar repetirlo.',
    errorDetails,
  ].join('\n\n');
};

const buildRetryPrepPrompt = ({ score, questions }) => {
  const incorrectQuestions = questions.filter((question) => !question.userAnswer?.isCorrect);
  const weakTopics = incorrectQuestions
    .map((question) => question.explanation || question.question)
    .slice(0, 3)
    .join(' | ');

  return [
    `Preparame para reintentar este quiz. Mi ultimo resultado fue ${score}%.`,
    'Necesito un plan corto de repaso, 3 preguntas de practica y consejos concretos para mejorar en el siguiente intento.',
    weakTopics ? `Temas donde falle: ${weakTopics}` : null,
  ]
    .filter(Boolean)
    .join('\n\n');
};

const QuizResults = ({ attemptId, onRetry, onContinue, onTutorAction }) => {
  const { data, isLoading, error } = useGetQuizResultsQuery(attemptId);
  const { t } = useTranslation();

  if (isLoading) {
    return (
      <Card className="max-w-2xl mx-auto mt-8">
        <CardContent className="p-6">
          <Skeleton className="h-64 w-full" />
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="max-w-2xl mx-auto mt-8">
        <CardContent className="p-6">
          <div className="text-center text-red-500">
            <AlertCircle className="h-12 w-12 mx-auto mb-4" />
            <p>Error al cargar los resultados</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const results = data?.results;
  const attempt = results?.attempt;
  const questions = results?.questions || [];

  if (!results || !attempt) {
    return (
      <Card className="max-w-2xl mx-auto mt-8">
        <CardContent className="p-6">
          <div className="text-center">
            <p>No se encontraron resultados</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const score = attempt.percentage;
  const totalQuestions = questions.length;
  const correctAnswers = questions.filter((question) => question.userAnswer?.isCorrect).length;
  const incorrectAnswers = questions.filter((question) => !question.userAnswer?.isCorrect).length;
  const timeTaken = attempt.timeSpent;
  const passed = attempt.passed;

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <Card className="max-w-2xl mx-auto mt-8">
      <CardHeader className="text-center">
        <div className="flex justify-center mb-4">
          {passed ? (
            <Trophy className="h-16 w-16 text-yellow-500" />
          ) : (
            <AlertCircle className="h-16 w-16 text-red-500" />
          )}
        </div>
        <CardTitle className="text-2xl">
          {passed ? '¡Felicitaciones!' : 'Inténtalo de nuevo'}
        </CardTitle>
        <p className="text-gray-600">
          {passed ? 'Has completado el quiz exitosamente' : 'No has alcanzado el puntaje mínimo'}
        </p>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-2 gap-4 text-center">
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="text-2xl font-bold text-blue-600">{score}%</div>
            <div className="text-sm text-gray-600">{t('quiz.final_score')}</div>
          </div>
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="text-2xl font-bold text-green-600">
              {correctAnswers}/{totalQuestions}
            </div>
            <div className="text-sm text-gray-600">{t('quiz.correct_answers')}</div>
          </div>
        </div>

        {timeTaken ? (
          <div className="flex items-center justify-center gap-2 text-gray-600">
            <Clock className="h-4 w-4" />
            <span>{t('quiz.time_taken')}: {formatTime(timeTaken)}</span>
          </div>
        ) : null}

        <div className="text-center">
          <Badge variant={passed ? 'default' : 'destructive'} className="text-lg px-4 py-2">
            {passed ? 'APROBADO' : 'NO APROBADO'}
          </Badge>
        </div>

        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>{t('quiz.your_score')}: {score}%</span>
            <span>{passed ? 'Desbloqueado' : 'Requiere reintento'}</span>
          </div>
          <Progress value={score} className="h-3" />
        </div>

        <Alert className={passed ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'}>
          {passed ? (
            <CheckCircle className="h-4 w-4 text-green-600" />
          ) : (
            <XCircle className="h-4 w-4 text-red-600" />
          )}
          <AlertDescription className={passed ? 'text-green-800' : 'text-red-800'}>
            {passed
              ? `Aprobaste con ${score}%. Ya puedes continuar con el siguiente contenido.`
              : `Obtuviste ${score}%. Revisa las respuestas incorrectas y vuelve a intentarlo para desbloquear el siguiente capítulo.`}
          </AlertDescription>
        </Alert>

        {questions.length > 0 && (
          <div className="space-y-4">
            <h3 className="font-semibold text-lg flex items-center gap-2">
              <Target className="h-5 w-5" />
              {t('quiz.question_review')}
            </h3>
            {questions.map((question, index) => {
              const userAnswer = question.userAnswer;
              const isCorrect = Boolean(userAnswer?.isCorrect);

              return (
                <Card key={index} className={isCorrect ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'}>
                  <CardContent className="p-4">
                    <div className="flex items-start gap-3">
                      {isCorrect ? (
                        <CheckCircle className="h-5 w-5 text-green-600 mt-1 flex-shrink-0" />
                      ) : (
                        <XCircle className="h-5 w-5 text-red-600 mt-1 flex-shrink-0" />
                      )}

                      <div className="flex-1 space-y-2">
                        <div className="flex items-center gap-2">
                          <span className="font-medium">{t('quiz.quiz_question')} {index + 1}</span>
                          <span className={`text-xs px-2 py-1 rounded ${
                            isCorrect ? 'bg-green-200 text-green-800' : 'bg-red-200 text-red-800'
                          }`}>
                            {isCorrect ? t('quiz.correct') : t('quiz.incorrect')}
                          </span>
                        </div>

                        <p className="text-gray-700">{question.question}</p>

                        <div className="text-sm space-y-1">
                          <p className="text-gray-600">
                            <span className="font-medium">{t('quiz.your_answer')}:</span> {userAnswer?.textAnswer || userAnswer?.selectedOptions?.join(', ') || 'Sin respuesta'}
                          </p>
                          {!isCorrect && question.correctAnswer && (
                            <p className="text-gray-600">
                              <span className="font-medium">{t('quiz.correct_answer')}:</span> {Array.isArray(question.correctAnswer) ? question.correctAnswer.join(', ') : question.correctAnswer}
                            </p>
                          )}
                          {question.explanation && (
                            <div className="mt-2 p-2 bg-blue-50 rounded border-l-4 border-blue-400">
                              <p className="text-sm text-blue-800">
                                <span className="font-medium">{t('quiz.explanation')}:</span> {question.explanation}
                              </p>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
        <div className="flex flex-wrap gap-4 justify-center">
          {onTutorAction && (
            <>
              <Button
                type="button"
                variant="outline"
                onClick={() => onTutorAction({
                  prompt: buildExplainErrorsPrompt({ score, questions }),
                  interactionType: 'quiz_errors',
                })}
                className="flex items-center gap-2"
                disabled={incorrectAnswers === 0}
              >
                <Bot className="h-4 w-4" />
                Explícame mis errores
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => onTutorAction({
                  prompt: buildRetryPrepPrompt({ score, questions }),
                  interactionType: 'retry_prep',
                })}
                className="flex items-center gap-2"
              >
                <Bot className="h-4 w-4" />
                Prepárame un reintento
              </Button>
            </>
          )}
          {onRetry && (
            <Button variant="outline" onClick={onRetry} className="flex items-center gap-2">
              <RefreshCw className="h-4 w-4" />
              {t('quiz.retake_quiz')}
            </Button>
          )}
          {onContinue && (
            <Button onClick={onContinue}>
              {passed ? t('quiz.continue_learning') : t('quiz.back_to_course')}
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default QuizResults;