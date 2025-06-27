// Ejemplo de uso del sistema de quizzes
// Este archivo muestra cómo crear y usar quizzes en el LMS

// ===== EJEMPLO 1: Crear un Quiz Básico =====

const quizExample = {
  lectureId: "lecture_id_here",
  title: "Fundamentos de JavaScript - Variables",
  description: "Evalúa tu comprensión de variables en JavaScript",
  questions: [
    {
      question: "¿Cuál de las siguientes es la forma correcta de declarar una variable en JavaScript?",
      type: "multiple_choice",
      options: [
        { text: "var nombre = 'Juan';", isCorrect: true },
        { text: "variable nombre = 'Juan';", isCorrect: false },
        { text: "let nombre = 'Juan';", isCorrect: true },
        { text: "const nombre = 'Juan';", isCorrect: true }
      ],
      points: 1,
      explanation: "JavaScript permite declarar variables con var, let y const. 'variable' no es una palabra clave válida."
    },
    {
      question: "¿Cuál es la diferencia entre let y const?",
      type: "multiple_choice",
      options: [
        { text: "let permite reasignación, const no", isCorrect: true },
        { text: "const es más rápido que let", isCorrect: false },
        { text: "let solo funciona en funciones", isCorrect: false },
        { text: "No hay diferencia", isCorrect: false }
      ],
      points: 2,
      explanation: "let permite reasignar valores, mientras que const crea una referencia inmutable."
    },
    {
      question: "JavaScript es un lenguaje de programación interpretado.",
      type: "true_false",
      options: [
        { text: "Verdadero", isCorrect: true },
        { text: "Falso", isCorrect: false }
      ],
      points: 1,
      explanation: "JavaScript es interpretado por el navegador, no compilado."
    },
    {
      question: "¿Cuál es la función para convertir un string a número entero?",
      type: "short_answer",
      correctAnswer: "parseInt",
      points: 1,
      explanation: "parseInt() convierte un string a número entero."
    }
  ],
  timeLimit: 10, // 10 minutos
  passingScore: 75, // 75% para aprobar
  maxAttempts: 3
};

// ===== EJEMPLO 2: Respuestas de un Estudiante =====

const studentAnswers = {
  answers: [
    {
      questionId: "question_1_id",
      selectedOptions: ["var nombre = 'Juan';", "let nombre = 'Juan';"],
      textAnswer: null
    },
    {
      questionId: "question_2_id", 
      selectedOptions: ["let permite reasignación, const no"],
      textAnswer: null
    },
    {
      questionId: "question_3_id",
      selectedOptions: ["Verdadero"],
      textAnswer: null
    },
    {
      questionId: "question_4_id",
      selectedOptions: [],
      textAnswer: "parseInt"
    }
  ],
  timeSpent: 420 // 7 minutos en segundos
};

// ===== EJEMPLO 3: Llamadas a la API =====

// Crear quiz (Instructor)
const createQuiz = async () => {
  const response = await fetch('/api/v1/quiz/course/course_id_here', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer your_token_here'
    },
    body: JSON.stringify(quizExample)
  });
  
  const result = await response.json();
  console.log('Quiz creado:', result);
};

// Iniciar quiz (Estudiante)
const startQuiz = async (quizId) => {
  const response = await fetch(`/api/v1/quiz/${quizId}/start`, {
    method: 'POST',
    headers: {
      'Authorization': 'Bearer your_token_here'
    }
  });
  
  const result = await response.json();
  console.log('Quiz iniciado:', result);
  return result.attemptId;
};

// Enviar respuestas (Estudiante)
const submitQuiz = async (attemptId) => {
  const response = await fetch(`/api/v1/quiz/attempt/${attemptId}/submit`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer your_token_here'
    },
    body: JSON.stringify(studentAnswers)
  });
  
  const result = await response.json();
  console.log('Quiz enviado:', result);
};

// Ver resultados (Estudiante)
const getResults = async (attemptId) => {
  const response = await fetch(`/api/v1/quiz/attempt/${attemptId}/results`, {
    headers: {
      'Authorization': 'Bearer your_token_here'
    }
  });
  
  const result = await response.json();
  console.log('Resultados:', result);
};

// ===== EJEMPLO 4: Actualizar Progreso de Video =====

const updateVideoProgress = async (courseId, lectureId) => {
  const response = await fetch(`/api/v1/progress/course/${courseId}/lecture/${lectureId}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer your_token_here'
    },
    body: JSON.stringify({
      watchTime: 1800, // 30 minutos en segundos
      completed: true
    })
  });
  
  const result = await response.json();
  console.log('Progreso actualizado:', result);
};

// ===== EJEMPLO 5: Obtener Progreso del Curso =====

const getCourseProgress = async (courseId) => {
  const response = await fetch(`/api/v1/progress/course/${courseId}`, {
    headers: {
      'Authorization': 'Bearer your_token_here'
    }
  });
  
  const result = await response.json();
  console.log('Progreso del curso:', result);
};

// ===== EJEMPLO 6: Flujo Completo =====

const completeVideoAndQuiz = async (courseId, lectureId, quizId) => {
  try {
    // 1. Marcar video como completado
    await updateVideoProgress(courseId, lectureId);
    
    // 2. Iniciar quiz
    const attemptId = await startQuiz(quizId);
    
    // 3. Mostrar quiz al usuario (frontend)
    console.log('Mostrar quiz al usuario...');
    
    // 4. Usuario completa quiz (frontend)
    console.log('Usuario completa quiz...');
    
    // 5. Enviar respuestas
    await submitQuiz(attemptId);
    
    // 6. Mostrar resultados
    await getResults(attemptId);
    
    console.log('¡Video y quiz completados exitosamente!');
    
  } catch (error) {
    console.error('Error en el flujo:', error);
  }
};

// ===== EJEMPLO 7: Crear Quiz Avanzado =====

const advancedQuizExample = {
  lectureId: "advanced_lecture_id",
  title: "Programación Orientada a Objetos",
  description: "Evalúa tu comprensión de POO en JavaScript",
  questions: [
    {
      question: "¿Cuáles son los principios fundamentales de POO?",
      type: "multiple_choice",
      options: [
        { text: "Encapsulación", isCorrect: true },
        { text: "Herencia", isCorrect: true },
        { text: "Polimorfismo", isCorrect: true },
        { text: "Abstracción", isCorrect: true },
        { text: "Recursión", isCorrect: false }
      ],
      points: 2,
      explanation: "Los cuatro principios fundamentales son: Encapsulación, Herencia, Polimorfismo y Abstracción."
    },
    {
      question: "¿Qué método se ejecuta automáticamente al crear una nueva instancia de una clase?",
      type: "short_answer",
      correctAnswer: "constructor",
      points: 1,
      explanation: "El método constructor se ejecuta automáticamente al crear una nueva instancia."
    },
    {
      question: "En JavaScript, las clases son azúcar sintáctico sobre prototipos.",
      type: "true_false",
      options: [
        { text: "Verdadero", isCorrect: true },
        { text: "Falso", isCorrect: false }
      ],
      points: 1,
      explanation: "Las clases en JavaScript son una forma más clara de trabajar con prototipos."
    }
  ],
  timeLimit: 15,
  passingScore: 80,
  maxAttempts: 2
};

export {
  quizExample,
  studentAnswers,
  advancedQuizExample,
  createQuiz,
  startQuiz,
  submitQuiz,
  getResults,
  updateVideoProgress,
  getCourseProgress,
  completeVideoAndQuiz
}; 