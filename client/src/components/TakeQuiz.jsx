import React, { useEffect, useRef, useState } from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Textarea } from './ui/textarea';
import { Skeleton } from './ui/skeleton';
import QuizResults from './QuizResults';
import { useStartQuizMutation, useSubmitQuizMutation } from '@/features/api/quizApi';
import { useUpdateQuizProgressMutation } from '@/features/api/courseProgressApi';
import { toast } from 'sonner';
import { useTranslation } from 'react-i18next';

const getQuestionText = (question) => {
  if (typeof question?.question === 'string' && question.question.trim()) {
    return question.question;
  }

  if (typeof question?._doc?.question === 'string' && question._doc.question.trim()) {
    return question._doc.question;
  }

  return '';
};

const getOptionText = (option) => {
  if (typeof option === 'string' && option.trim()) {
    return option;
  }

  if (typeof option?.text === 'string' && option.text.trim()) {
    return option.text;
  }

  if (typeof option?._doc?.text === 'string' && option._doc.text.trim()) {
    return option._doc.text;
  }

  return '';
};

const normalizeQuizPayload = (quizData) => {
  if (!quizData) {
    return null;
  }

  return {
    ...quizData,
    questions: (quizData.questions || []).map((question) => ({
      ...question,
      _id: question?._id || question?._doc?._id,
      question: getQuestionText(question),
      options: (question?.options || question?._doc?.options || []).map((option, index) => ({
        _id: option?._id || option?._doc?._id || `${question?._id || question?._doc?._id || 'option'}-${index}`,
        text: getOptionText(option),
      })),
    })),
  };
};

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
  const initializedQuizIdRef = useRef(null);

  // Fetch quiz and start attempt
  useEffect(() => {
    if (!quizId || initializedQuizIdRef.current === quizId) {
      return;
    }

    let cancelled = false;

    const initializeQuiz = async () => {
      setLoading(true);
      setError(null);
      try {
        const result = await startQuiz(quizId).unwrap();
        if (cancelled) {
          return;
        }
        const normalizedQuiz = normalizeQuizPayload(result.quiz);
        initializedQuizIdRef.current = quizId;
        setQuiz(normalizedQuiz);
        setAttemptId(result.attemptId);
        setAnswers((normalizedQuiz?.questions || []).map(q => ({
          questionId: q._id,
          selectedOptions: [],
          textAnswer: ''
        })));
      } catch (err) {
        initializedQuizIdRef.current = null;
        if (cancelled) {
          return;
        }
        setError(err.data?.message || 'No se pudo iniciar el quiz');
        toast.error('Error al cargar el quiz');
      }
      if (!cancelled) {
        setLoading(false);
      }
    };

    initializeQuiz();

    return () => {
      cancelled = true;
      if (initializedQuizIdRef.current !== quizId) {
        initializedQuizIdRef.current = null;
      }
    };
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
      toast[result.result.passed ? 'success' : 'error'](
        result.result.passed
          ? t('quiz.quiz_submitted_successfully')
          : `Obtuviste ${result.result.percentage}%. Revisa las respuestas y vuelve a intentarlo.`
      );
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

  const unansweredQuestions = answers.filter((answer, index) => {
    const question = quiz.questions[index];
    if (question.type === 'short_answer') {
      return !answer.textAnswer.trim();
    }

    return answer.selectedOptions.length === 0;
  }).length;

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
        <p className="text-xs text-gray-500">
          Debes responder todas las preguntas. Puntaje mínimo: {quiz.passingScore || 70}%.
        </p>
      </CardHeader>
      <CardContent>
        <form onSubmit={e => { e.preventDefault(); handleSubmit(); }} className="space-y-8">
          {quiz.questions.map((q, idx) => (
            <div key={q._id} className="mb-6">
              <div className="mb-2 font-medium text-slate-900">{idx + 1}. {q.question}</div>
              {q.type === 'multiple_choice' && (
                <div className="space-y-2">
                  {q.options.map((opt, oidx) => (
                    <label key={opt._id || oidx} className="flex items-center gap-2 text-slate-700">
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
                    <label key={opt._id || oidx} className="flex items-center gap-2 text-slate-700">
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
          {unansweredQuestions > 0 && (
            <p className="text-sm text-amber-600">
              Te faltan {unansweredQuestions} pregunta(s) por responder antes de enviar.
            </p>
          )}
          <Button type="submit" disabled={submitting || unansweredQuestions > 0} className="w-full">
            {submitting ? t('quiz.submitting') : t('quiz.submit_quiz')}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default TakeQuiz; 