import React, { useEffect, useState } from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { Skeleton } from './ui/skeleton';
import QuizResults from './QuizResults';
import { useStartQuizMutation, useSubmitQuizMutation } from '@/features/api/quizApi';
import { toast } from 'sonner';

const TakeQuiz = ({ quizId, onQuizCompleted, onContinue }) => {
  const [startQuiz, { isLoading: startingQuiz }] = useStartQuizMutation();
  const [submitQuiz, { isLoading: submitting }] = useSubmitQuizMutation();
  
  const [quiz, setQuiz] = useState(null);
  const [attemptId, setAttemptId] = useState(null);
  const [answers, setAnswers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showResults, setShowResults] = useState(false);
  const [error, setError] = useState(null);

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
      setShowResults(true);
      onQuizCompleted && onQuizCompleted(result.result);
      toast.success('Quiz enviado exitosamente');
    } catch (err) {
      setError(err.data?.message || 'No se pudo enviar el quiz');
      toast.error('Error al enviar el quiz');
    }
  };

  const handleRetry = () => {
    setShowResults(false);
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
            {submitting ? 'Enviando...' : 'Enviar Quiz'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default TakeQuiz; 