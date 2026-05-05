import React, { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Trash2, Plus, Save } from 'lucide-react';
import { useUpdateQuizMutation } from '@/features/api/quizApi';
import { toast } from 'sonner';
import { useTranslation } from 'react-i18next';

const EditQuiz = ({ quiz, onQuizUpdated, onCancel }) => {
  const { t } = useTranslation();
  const [updateQuiz, { isLoading }] = useUpdateQuizMutation();
  
  const [quizData, setQuizData] = useState({
    title: '',
    description: '',
    timeLimit: 10,
    passingScore: 70,
    maxAttempts: 3,
    questions: []
  });

  const [currentQuestion, setCurrentQuestion] = useState({
    question: '',
    type: 'multiple_choice',
    options: [{ text: '', isCorrect: false }],
    correctAnswer: '',
    points: 1,
    explanation: ''
  });

  const [editingQuestionIndex, setEditingQuestionIndex] = useState(-1);

  // Initialize form with quiz data
  useEffect(() => {
    if (quiz) {
      setQuizData({
        title: quiz.title || '',
        description: quiz.description || '',
        timeLimit: quiz.timeLimit || 10,
        passingScore: quiz.passingScore || 70,
        maxAttempts: quiz.maxAttempts || 3,
        questions: quiz.questions || []
      });
    }
  }, [quiz]);

  const addOrUpdateQuestion = () => {
    if (currentQuestion.question.trim() === '') {
      toast.error(t('quiz.please_enter_question') || 'Por favor ingresa una pregunta');
      return;
    }

    if (currentQuestion.type === 'multiple_choice' && currentQuestion.options.length < 2) {
      toast.error(t('quiz.add_at_least_2_options') || 'Agrega al menos 2 opciones');
      return;
    }

    const hasCorrectAnswer = currentQuestion.options.some(opt => opt.isCorrect);
    if (currentQuestion.type === 'multiple_choice' && !hasCorrectAnswer) {
      toast.error('Marca al menos una respuesta correcta');
      return;
    }

    if (currentQuestion.type === 'short_answer' && !currentQuestion.correctAnswer.trim()) {
      toast.error(t('quiz.enter_correct_answer') || 'Ingresa la respuesta correcta');
      return;
    }

    if (editingQuestionIndex >= 0) {
      // Update existing question
      setQuizData(prev => ({
        ...prev,
        questions: prev.questions.map((q, index) => 
          index === editingQuestionIndex ? { ...currentQuestion } : q
        )
      }));
      setEditingQuestionIndex(-1);
    } else {
      // Add new question
      setQuizData(prev => ({
        ...prev,
        questions: [...prev.questions, { ...currentQuestion }]
      }));
    }

    // Reset current question
    setCurrentQuestion({
      question: '',
      type: 'multiple_choice',
      options: [{ text: '', isCorrect: false }],
      correctAnswer: '',
      points: 1,
      explanation: ''
    });
  };

  const editQuestion = (index) => {
    const question = quizData.questions[index];
    setCurrentQuestion({ ...question });
    setEditingQuestionIndex(index);
  };

  const removeQuestion = (index) => {
    setQuizData(prev => ({
      ...prev,
      questions: prev.questions.filter((_, i) => i !== index)
    }));

    // If we were editing this question, cancel editing
    if (editingQuestionIndex === index) {
      setEditingQuestionIndex(-1);
      setCurrentQuestion({
        question: '',
        type: 'multiple_choice',
        options: [{ text: '', isCorrect: false }],
        correctAnswer: '',
        points: 1,
        explanation: ''
      });
    }
  };

  const addOption = () => {
    setCurrentQuestion(prev => ({
      ...prev,
      options: [...prev.options, { text: '', isCorrect: false }]
    }));
  };

  const removeOption = (index) => {
    setCurrentQuestion(prev => ({
      ...prev,
      options: prev.options.filter((_, i) => i !== index)
    }));
  };

  const updateOption = (index, field, value) => {
    setCurrentQuestion(prev => ({
      ...prev,
      options: prev.options.map((option, i) => 
        i === index ? { ...option, [field]: value } : option
      )
    }));
  };

  const handleSubmit = async () => {
    if (quizData.questions.length === 0) {
      toast.error(t('quiz.add_at_least_one_question') || 'Agrega al menos una pregunta');
      return;
    }

    try {
      await updateQuiz({
        quizId: quiz._id,
        updateData: quizData
      }).unwrap();

      toast.success(t('quiz.quiz_updated_successfully') || 'Quiz actualizado exitosamente');
      onQuizUpdated && onQuizUpdated();
    } catch (error) {
      console.error('Error:', error);
      toast.error((t('quiz.error_updating_quiz') || 'Error al actualizar quiz') + ': ' + (error.data?.message || t('messages.unknown_error')));
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Editar Quiz</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Quiz Basic Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="title">Título del Quiz</Label>
              <Input
                id="title"
                value={quizData.title}
                onChange={(e) => setQuizData(prev => ({ ...prev, title: e.target.value }))}
                placeholder="Título del quiz"
              />
            </div>
            <div>
              <Label htmlFor="description">Descripción</Label>
              <Input
                id="description"
                value={quizData.description}
                onChange={(e) => setQuizData(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Descripción del quiz"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="timeLimit">Tiempo límite (min)</Label>
              <Input
                id="timeLimit"
                type="number"
                value={quizData.timeLimit}
                onChange={(e) => setQuizData(prev => ({ ...prev, timeLimit: parseInt(e.target.value) }))}
                min="0"
              />
            </div>
            <div>
              <Label htmlFor="passingScore">Nota mínima (%)</Label>
              <Input
                id="passingScore"
                type="number"
                value={quizData.passingScore}
                onChange={(e) => setQuizData(prev => ({ ...prev, passingScore: parseInt(e.target.value) }))}
                min="0"
                max="100"
              />
            </div>
            <div>
              <Label htmlFor="maxAttempts">Intentos máximos</Label>
              <Input
                id="maxAttempts"
                type="number"
                value={quizData.maxAttempts}
                onChange={(e) => setQuizData(prev => ({ ...prev, maxAttempts: parseInt(e.target.value) }))}
                min="1"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Existing Questions */}
      {quizData.questions.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Preguntas existentes ({quizData.questions.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {quizData.questions.map((question, index) => (
                <div key={index} className="border rounded-lg p-4 bg-gray-50 dark:bg-gray-900">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <p className="font-medium mb-2">
                        {index + 1}. {question.question}
                      </p>
                      {question.options?.map((option, optIndex) => (
                        <div 
                          key={optIndex} 
                          className={`text-sm px-2 py-1 rounded mb-1 ${
                            option.isCorrect 
                              ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' 
                              : 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300'
                          }`}
                        >
                          {String.fromCharCode(65 + optIndex)}. {option.text}
                          {option.isCorrect && <span className="ml-2 font-bold">✓</span>}
                        </div>
                      ))}
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => editQuestion(index)}
                        className="flex items-center gap-1"
                      >
                        <Save className="h-3 w-3" />
                        Editar
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => removeQuestion(index)}
                        className="flex items-center gap-1"
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Add/Edit Question Form */}
      <Card>
        <CardHeader>
          <CardTitle>
            {editingQuestionIndex >= 0 ? 'Editar pregunta' : 'Agregar nueva pregunta'}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="question">Pregunta</Label>
            <Textarea
              id="question"
              value={currentQuestion.question}
              onChange={(e) => setCurrentQuestion(prev => ({ ...prev, question: e.target.value }))}
              placeholder="Escribe tu pregunta aquí"
              rows={3}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="questionType">Tipo de pregunta</Label>
              <Select
                value={currentQuestion.type}
                onValueChange={(value) => setCurrentQuestion(prev => ({ 
                  ...prev, 
                  type: value,
                  options: value === 'multiple_choice' ? [{ text: '', isCorrect: false }] : []
                }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="multiple_choice">Opción múltiple</SelectItem>
                  <SelectItem value="short_answer">Respuesta corta</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="points">Puntos</Label>
              <Input
                id="points"
                type="number"
                value={currentQuestion.points}
                onChange={(e) => setCurrentQuestion(prev => ({ ...prev, points: parseInt(e.target.value) }))}
                min="1"
              />
            </div>
          </div>

          {/* Multiple Choice Options */}
          {currentQuestion.type === 'multiple_choice' && (
            <div className="space-y-4">
              <Label>Opciones de respuesta</Label>
              {currentQuestion.options.map((option, index) => (
                <div key={index} className="flex items-center gap-2">
                  <Input
                    value={option.text}
                    onChange={(e) => updateOption(index, 'text', e.target.value)}
                    placeholder={`Opción ${String.fromCharCode(65 + index)}`}
                    className="flex-1"
                  />
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={option.isCorrect}
                      onChange={(e) => updateOption(index, 'isCorrect', e.target.checked)}
                    />
                    <span className="text-sm">Correcta</span>
                  </label>
                  {currentQuestion.options.length > 1 && (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => removeOption(index)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              ))}
              
              <Button
                type="button"
                variant="outline"
                onClick={addOption}
                className="flex items-center gap-2"
              >
                <Plus className="h-4 w-4" />
                Agregar opción
              </Button>
            </div>
          )}

          {/* Short Answer */}
          {currentQuestion.type === 'short_answer' && (
            <div>
              <Label htmlFor="correctAnswer">Respuesta correcta</Label>
              <Input
                id="correctAnswer"
                value={currentQuestion.correctAnswer}
                onChange={(e) => setCurrentQuestion(prev => ({ ...prev, correctAnswer: e.target.value }))}
                placeholder="Respuesta correcta"
              />
            </div>
          )}

          {/* Explanation */}
          <div>
            <Label htmlFor="explanation">Explicación (opcional)</Label>
            <Textarea
              id="explanation"
              value={currentQuestion.explanation}
              onChange={(e) => setCurrentQuestion(prev => ({ ...prev, explanation: e.target.value }))}
              placeholder="Explicación de la respuesta"
              rows={2}
            />
          </div>

          <Button onClick={addOrUpdateQuestion} className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            {editingQuestionIndex >= 0 ? 'Actualizar pregunta' : 'Agregar pregunta'}
          </Button>
        </CardContent>
      </Card>

      {/* Action Buttons */}
      <div className="flex justify-end gap-4">
        <Button variant="outline" onClick={onCancel}>
          Cancelar
        </Button>
        <Button 
          onClick={handleSubmit} 
          disabled={isLoading || quizData.questions.length === 0}
          className="flex items-center gap-2"
        >
          {isLoading ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              Actualizando...
            </>
          ) : (
            <>
              <Save className="h-4 w-4" />
              Guardar cambios
            </>
          )}
        </Button>
      </div>
    </div>
  );
};

export default EditQuiz;