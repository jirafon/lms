import React, { useState } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Trash2, Plus, Save } from 'lucide-react';
import { useCreateQuizMutation } from '@/features/api/quizApi';
import { toast } from 'sonner';

const CreateQuiz = ({ courseId, lectureId, onQuizCreated }) => {
  const [createQuiz, { isLoading }] = useCreateQuizMutation();
  
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

  const addQuestion = () => {
    if (currentQuestion.question.trim() === '') {
      toast.error('Por favor ingresa una pregunta');
      return;
    }

    if (currentQuestion.type === 'multiple_choice' && currentQuestion.options.length < 2) {
      toast.error('Debes agregar al menos 2 opciones');
      return;
    }

    if (currentQuestion.type === 'short_answer' && !currentQuestion.correctAnswer.trim()) {
      toast.error('Debes ingresar la respuesta correcta');
      return;
    }

    setQuizData(prev => ({
      ...prev,
      questions: [...prev.questions, { ...currentQuestion }]
    }));

    setCurrentQuestion({
      question: '',
      type: 'multiple_choice',
      options: [{ text: '', isCorrect: false }],
      correctAnswer: '',
      points: 1,
      explanation: ''
    });
  };

  const removeQuestion = (index) => {
    setQuizData(prev => ({
      ...prev,
      questions: prev.questions.filter((_, i) => i !== index)
    }));
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
      toast.error('Debes agregar al menos una pregunta');
      return;
    }

    try {
      const result = await createQuiz({
        courseId,
        quizData: {
          ...quizData,
          lectureId
        }
      }).unwrap();

      toast.success('Quiz creado exitosamente');
      onQuizCreated && onQuizCreated(result.quiz);
      
      // Reset form
      setQuizData({
        title: '',
        description: '',
        timeLimit: 10,
        passingScore: 70,
        maxAttempts: 3,
        questions: []
      });
    } catch (error) {
      console.error('Error:', error);
      toast.error('Error al crear el quiz: ' + (error.data?.message || 'Error desconocido'));
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Crear Quiz</CardTitle>
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
                placeholder="Ej: Fundamentos de JavaScript"
              />
            </div>
            <div>
              <Label htmlFor="description">Descripción</Label>
              <Input
                id="description"
                value={quizData.description}
                onChange={(e) => setQuizData(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Breve descripción del quiz"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="timeLimit">Tiempo Límite (minutos)</Label>
              <Input
                id="timeLimit"
                type="number"
                value={quizData.timeLimit}
                onChange={(e) => setQuizData(prev => ({ ...prev, timeLimit: parseInt(e.target.value) }))}
                min="0"
              />
            </div>
            <div>
              <Label htmlFor="passingScore">Puntaje Mínimo (%)</Label>
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
              <Label htmlFor="maxAttempts">Máximo de Intentos</Label>
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

      {/* Add Question Form */}
      <Card>
        <CardHeader>
          <CardTitle>Agregar Pregunta</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="question">Pregunta</Label>
            <Textarea
              id="question"
              value={currentQuestion.question}
              onChange={(e) => setCurrentQuestion(prev => ({ ...prev, question: e.target.value }))}
              placeholder="Escribe tu pregunta aquí..."
              rows={3}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="questionType">Tipo de Pregunta</Label>
              <Select
                value={currentQuestion.type}
                onValueChange={(value) => setCurrentQuestion(prev => ({ ...prev, type: value }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="multiple_choice">Opción Múltiple</SelectItem>
                  <SelectItem value="true_false">Verdadero/Falso</SelectItem>
                  <SelectItem value="short_answer">Respuesta Corta</SelectItem>
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

          {/* Options for Multiple Choice */}
          {currentQuestion.type === 'multiple_choice' && (
            <div className="space-y-2">
              <Label>Opciones</Label>
              {currentQuestion.options.map((option, index) => (
                <div key={index} className="flex gap-2">
                  <Input
                    value={option.text}
                    onChange={(e) => updateOption(index, 'text', e.target.value)}
                    placeholder={`Opción ${index + 1}`}
                  />
                  <input
                    type="checkbox"
                    checked={option.isCorrect}
                    onChange={(e) => updateOption(index, 'isCorrect', e.target.checked)}
                    className="mt-2"
                  />
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => removeOption(index)}
                    disabled={currentQuestion.options.length <= 1}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
              <Button variant="outline" size="sm" onClick={addOption}>
                <Plus className="h-4 w-4 mr-2" />
                Agregar Opción
              </Button>
            </div>
          )}

          {/* True/False Options */}
          {currentQuestion.type === 'true_false' && (
            <div className="space-y-2">
              <Label>Opciones</Label>
              <div className="flex gap-4">
                <label className="flex items-center gap-2">
                  <input
                    type="radio"
                    name="trueFalse"
                    checked={currentQuestion.options[0]?.isCorrect}
                    onChange={() => setCurrentQuestion(prev => ({
                      ...prev,
                      options: [
                        { text: 'Verdadero', isCorrect: true },
                        { text: 'Falso', isCorrect: false }
                      ]
                    }))}
                  />
                  Verdadero
                </label>
                <label className="flex items-center gap-2">
                  <input
                    type="radio"
                    name="trueFalse"
                    checked={currentQuestion.options[1]?.isCorrect}
                    onChange={() => setCurrentQuestion(prev => ({
                      ...prev,
                      options: [
                        { text: 'Verdadero', isCorrect: false },
                        { text: 'Falso', isCorrect: true }
                      ]
                    }))}
                  />
                  Falso
                </label>
              </div>
            </div>
          )}

          {/* Correct Answer for Short Answer */}
          {currentQuestion.type === 'short_answer' && (
            <div>
              <Label htmlFor="correctAnswer">Respuesta Correcta</Label>
              <Input
                id="correctAnswer"
                value={currentQuestion.correctAnswer}
                onChange={(e) => setCurrentQuestion(prev => ({ ...prev, correctAnswer: e.target.value }))}
                placeholder="Respuesta correcta"
              />
            </div>
          )}

          <div>
            <Label htmlFor="explanation">Explicación (Opcional)</Label>
            <Textarea
              id="explanation"
              value={currentQuestion.explanation}
              onChange={(e) => setCurrentQuestion(prev => ({ ...prev, explanation: e.target.value }))}
              placeholder="Explicación que verá el estudiante después de responder"
              rows={2}
            />
          </div>

          <Button onClick={addQuestion} className="w-full">
            <Plus className="h-4 w-4 mr-2" />
            Agregar Pregunta
          </Button>
        </CardContent>
      </Card>

      {/* Questions List */}
      {quizData.questions.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Preguntas ({quizData.questions.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {quizData.questions.map((question, index) => (
                <div key={index} className="border rounded-lg p-4">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <h4 className="font-medium">Pregunta {index + 1}</h4>
                      <p className="text-sm text-gray-600 mt-1">{question.question}</p>
                      <p className="text-xs text-gray-500 mt-1">
                        Tipo: {question.type === 'multiple_choice' ? 'Opción Múltiple' : 
                               question.type === 'true_false' ? 'Verdadero/Falso' : 'Respuesta Corta'} | 
                        Puntos: {question.points}
                      </p>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => removeQuestion(index)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Submit Button */}
      <div className="flex justify-end">
        <Button onClick={handleSubmit} disabled={isLoading || quizData.questions.length === 0}>
          <Save className="h-4 w-4 mr-2" />
          {isLoading ? 'Creando...' : 'Crear Quiz'}
        </Button>
      </div>
    </div>
  );
};

export default CreateQuiz; 