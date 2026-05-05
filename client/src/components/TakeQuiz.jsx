import React, { useEffect, useState } from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { Skeleton } from './ui/skeleton';
import QuizResults from './QuizResults';
import { useStartQuizMutation, useSubmitQuizMutation } from '@/features/api/quizApi';
import { useUpdateQuizProgressMutation } from '@/features/api/courseProgressApi';
import { toast } from 'sonner';
import { useTranslation } from 'react-i18next';

const TakeQuiz = ({ quizId, onQuizCompleted, onContinue }) => {
  const { t } = useTranslation();
  const [startQuiz, { isLoading: startingQuiz }] = useStartQuizMutation();
  const [submitQuiz, { isLoading: submitting }] = useSubmitQuizMutation();
  const [updateQuizProgress] = useUpdateQuizProgressMutation();
  
  const [quiz, setQuiz] = useState(null);
  const [attemptId, setAttemptId] = useState(null);
  const [answers, setAnswers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showResults, setShowResults] = useState(false);
  const [error, setError] = useState(null);
  const [results, setResults] = useState(null);

  // Fetch quiz and start attempt
  useEffect(() => {
    const initializeQuiz = async () => {
      setLoading(true);
      setError(null);
      try {
        const result = await startQuiz(quizId).unwrap();
        setQuiz(result.quiz);
        setAttemptId(result.attemptId);
        setAnswers(result.quiz.questions.map(q => ({
          questionId: q._id,
          selectedOptions: [],
          textAnswer: ''
        })));
      } catch (err) {
        setError(err.data?.message || 'No se pudo iniciar el quiz');
        toast.error('Error al cargar el quiz');
      }
      setLoading(false);
    };
    if (quizId) initializeQuiz();
  }, [quizId, startQuiz]);

  const handleOptionChange = (qIdx, optText, checked) => {
    setAnswers(prev => prev.map((ans, idx) => {
      if (idx !== qIdx) return ans;
      let selected = ans.selectedOptions;
      if (quiz.questions[qIdx].type === 'multiple_choice') {
        selected = checked
          ? [...selected, optText]
          : selected.filter(opt => opt !== optText);
      } else {
        selected = checked ? [optText] : [];
      }
      return { ...ans, selectedOptions: selected };
    }));
  };

  const handleTextAnswer = (qIdx, value) => {
    setAnswers(prev => prev.map((ans, idx) => idx === qIdx ? { ...ans, textAnswer: value } : ans));
  };

  const handleSubmit = async () => {
    setError(null);
    try {
      const result = await submitQuiz({ attemptId, answers }).unwrap();
      setResults(result.result);
      setShowResults(true);
      
      // Update course progress if quiz has lecture and course info
      if (quiz.lectureId && quiz.courseId && result.result.passed) {
        try {
          await updateQuizProgress({
            courseId: quiz.courseId,
            lectureId: quiz.lectureId,
            score: result.result.percentage,
            passed: result.result.passed
          });
        } catch (progressError) {
          console.log('Error updating progress:', progressError);
          // Continue even if progress update fails
        }
      }
      
      onQuizCompleted && onQuizCompleted(result.result);
      toast.success(t('quiz.quiz_submitted_successfully'));
    } catch (err) {
      setError(err.data?.message || 'No se pudo enviar el quiz');
      toast.error(t('quiz.error_submitting_quiz') + ': ' + (err.data?.message || t('messages.unknown_error')));
    }
  };

  const handleRetry = () => {
    setShowResults(false);
    setResults(null);
    setAnswers(quiz.questions.map(q => ({
      questionId: q._id,
      selectedOptions: [],
      textAnswer: ''
    })));
  };

  if (loading || startingQuiz) return <Skeleton className="h-64 w-full" />;
  if (error) return <div className="text-red-500">{error}</div>;
  if (!quiz) return null;

  if (showResults) {
    return (
      <QuizResults 
        attemptId={attemptId}
        results={results}
        onRetry={handleRetry}
        onContinue={onContinue}
      />
    );
  }

  return (
    <Card className="max-w-2xl mx-auto mt-8">
      <CardHeader>
        <CardTitle>{quiz.title}</CardTitle>
        <p className="text-sm text-gray-500">{quiz.description}</p>
      </CardHeader>
      <CardContent>
        <form onSubmit={e => { e.preventDefault(); handleSubmit(); }} className="space-y-8">
          {quiz.questions.map((q, idx) => (
            <div key={q._id} className="mb-6">
              <div className="font-medium mb-2">{idx + 1}. {q.question}</div>
              {q.type === 'multiple_choice' && (
                <div className="space-y-2">
                  {q.options.map((opt, oidx) => (
                    <label key={oidx} className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={answers[idx].selectedOptions.includes(opt.text)}
                        onChange={e => handleOptionChange(idx, opt.text, e.target.checked)}
                      />
                      {opt.text}
                    </label>
                  ))}
                </div>
              )}
              {q.type === 'true_false' && (
                <div className="space-y-2">
                  {q.options.map((opt, oidx) => (
                    <label key={oidx} className="flex items-center gap-2">
                      <input
                        type="radio"
                        name={`tf-${q._id}`}
                        checked={answers[idx].selectedOptions.includes(opt.text)}
                        onChange={e => handleOptionChange(idx, opt.text, e.target.checked)}
                      />
                      {opt.text}
                    </label>
                  ))}
                </div>
              )}
              {q.type === 'short_answer' && (
                <Textarea
                  value={answers[idx].textAnswer}
                  onChange={e => handleTextAnswer(idx, e.target.value)}
                  placeholder="Tu respuesta"
                />
              )}
            </div>
          ))}
          <Button type="submit" disabled={submitting} className="w-full">
            {submitting ? t('quiz.submitting') : t('quiz.submit_quiz')}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default TakeQuiz; 