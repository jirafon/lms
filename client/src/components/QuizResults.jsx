import React, { useEffect, useState } from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { CheckCircle, XCircle, AlertCircle, Clock, Trophy, RefreshCw } from 'lucide-react';
import { Skeleton } from './ui/skeleton';
import { useGetQuizResultsQuery } from '@/features/api/quizApi';
import { toast } from 'sonner';

const QuizResults = ({ attemptId, onRetry, onContinue }) => {
  const { data: result, isLoading, error } = useGetQuizResultsQuery(attemptId);

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

  if (!result) {
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

  const { quiz, score, totalQuestions, correctAnswers, timeTaken, passed } = result;

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
        {/* Score Summary */}
        <div className="grid grid-cols-2 gap-4 text-center">
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="text-2xl font-bold text-blue-600">{score}%</div>
            <div className="text-sm text-gray-600">Puntaje Final</div>
          </div>
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="text-2xl font-bold text-green-600">
              {correctAnswers}/{totalQuestions}
            </div>
            <div className="text-sm text-gray-600">Respuestas Correctas</div>
          </div>
        </div>

        {/* Time Taken */}
        {timeTaken && (
          <div className="flex items-center justify-center gap-2 text-gray-600">
            <Clock className="h-4 w-4" />
            <span>Tiempo: {Math.floor(timeTaken / 60)}:{(timeTaken % 60).toString().padStart(2, '0')}</span>
          </div>
        )}

        {/* Pass/Fail Status */}
        <div className="text-center">
          <Badge variant={passed ? "default" : "destructive"} className="text-lg px-4 py-2">
            {passed ? 'APROBADO' : 'NO APROBADO'}
          </Badge>
        </div>

        {/* Question Review */}
        {quiz && quiz.questions && (
          <div className="space-y-4">
            <h3 className="font-semibold text-lg">Revisión de Preguntas</h3>
            {quiz.questions.map((question, index) => {
              const userAnswer = result.userAnswers?.[index];
              const isCorrect = result.correctAnswers?.[index];
              
              return (
                <div key={index} className="border rounded-lg p-4">
                  <div className="flex items-start gap-2 mb-2">
                    {isCorrect ? (
                      <CheckCircle className="h-5 w-5 text-green-500 mt-0.5" />
                    ) : (
                      <XCircle className="h-5 w-5 text-red-500 mt-0.5" />
                    )}
                    <div className="flex-1">
                      <p className="font-medium">Pregunta {index + 1}</p>
                      <p className="text-sm text-gray-600">{question.question}</p>
                    </div>
                  </div>
                  
                  {userAnswer && (
                    <div className="ml-7 space-y-1">
                      <p className="text-sm">
                        <span className="font-medium">Tu respuesta:</span> {userAnswer}
                      </p>
                      {!isCorrect && question.correctAnswer && (
                        <p className="text-sm text-green-600">
                          <span className="font-medium">Respuesta correcta:</span> {question.correctAnswer}
                        </p>
                      )}
                      {question.explanation && (
                        <p className="text-sm text-gray-500 italic">
                          {question.explanation}
                        </p>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-4 justify-center">
          {onRetry && (
            <Button variant="outline" onClick={onRetry} className="flex items-center gap-2">
              <RefreshCw className="h-4 w-4" />
              Intentar de Nuevo
            </Button>
          )}
          {onContinue && (
            <Button onClick={onContinue}>
              Continuar
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default QuizResults; 