import dotenv from 'dotenv';
import connectDB from './database/db.js';
import { Course } from './models/course.model.js';
import { Lecture } from './models/lecture.model.js';
import { Quiz } from './models/quiz.model.js';
import mongoose from 'mongoose';

dotenv.config();

// Datos del quiz de privacidad organizados por capítulos
const privacyQuizData = [
  {
    chapter: "CAPÍTULO 1 – ¿Qué es un dato personal?",
    questions: [
      {
        question: "¿Qué es un dato personal?",
        type: "multiple_choice",
        options: [
          { text: "Información de la empresa", isCorrect: false },
          { text: "Información que identifica o puede identificar a una persona", isCorrect: true },
          { text: "Información pública sin valor", isCorrect: false }
        ],
        points: 1
      },
      {
        question: "¿Cuál de estos es un dato personal?",
        type: "multiple_choice",
        options: [
          { text: "Nombre de un cliente", isCorrect: true },
          { text: "Nombre de una empresa", isCorrect: false },
          { text: "Código de producto", isCorrect: false }
        ],
        points: 1
      },
      {
        question: "¿Los datos personales deben ser protegidos?",
        type: "multiple_choice",
        options: [
          { text: "No", isCorrect: false },
          { text: "Sí", isCorrect: true }
        ],
        points: 1
      },
      {
        question: "¿Por qué son importantes los datos personales?",
        type: "multiple_choice",
        options: [
          { text: "Porque permiten identificar personas y deben usarse correctamente", isCorrect: true },
          { text: "Porque son fáciles de usar", isCorrect: false }
        ],
        points: 1
      }
    ]
  },
  {
    chapter: "CAPÍTULO 2 – Uso correcto de datos",
    questions: [
      {
        question: "¿Tener acceso a datos significa que puedes usarlos libremente?",
        type: "multiple_choice",
        options: [
          { text: "Sí", isCorrect: false },
          { text: "No", isCorrect: true }
        ],
        points: 1
      },
      {
        question: "¿Cuándo puedes usar datos personales?",
        type: "multiple_choice",
        options: [
          { text: "Siempre", isCorrect: false },
          { text: "Cuando es necesario, autorizado y parte de tu trabajo", isCorrect: true }
        ],
        points: 1
      },
      {
        question: "¿Cuál es un uso incorrecto?",
        type: "multiple_choice",
        options: [
          { text: "Usar datos para una venta solicitada", isCorrect: false },
          { text: "Contactar clientes desde tu celular personal usando datos de la empresa", isCorrect: true }
        ],
        points: 1
      },
      {
        question: "¿Qué debes hacer si tienes dudas?",
        type: "multiple_choice",
        options: [
          { text: "Usar los datos igual", isCorrect: false },
          { text: "No usarlos y consultar", isCorrect: true }
        ],
        points: 1
      }
    ]
  },
  {
    chapter: "CAPÍTULO 3 – Consentimiento y finalidad",
    questions: [
      {
        question: "¿Qué es el consentimiento?",
        type: "multiple_choice",
        options: [
          { text: "Uso libre de datos", isCorrect: false },
          { text: "Autorización de la persona para usar sus datos", isCorrect: true }
        ],
        points: 1
      },
      {
        question: "¿Qué es la finalidad?",
        type: "multiple_choice",
        options: [
          { text: "El lugar donde se guardan los datos", isCorrect: false },
          { text: "El propósito para el cual se recolectan los datos", isCorrect: true }
        ],
        points: 1
      },
      {
        question: "¿Se pueden usar datos para otro fin distinto al autorizado?",
        type: "multiple_choice",
        options: [
          { text: "Sí", isCorrect: false },
          { text: "No", isCorrect: true }
        ],
        points: 1
      },
      {
        question: "¿Cuál es un error común?",
        type: "multiple_choice",
        options: [
          { text: "Usar datos dentro del propósito", isCorrect: false },
          { text: "Usar datos para un objetivo no autorizado", isCorrect: true }
        ],
        points: 1
      }
    ]
  },
  {
    chapter: "CAPÍTULO 4 – Manejo seguro de bases de datos",
    questions: [
      {
        question: "¿Cuál es un riesgo al descargar bases de datos?",
        type: "multiple_choice",
        options: [
          { text: "Ninguno", isCorrect: false },
          { text: "Pérdida de control y trazabilidad", isCorrect: true }
        ],
        points: 1
      },
      {
        question: "¿Es correcto enviar datos a correo personal?",
        type: "multiple_choice",
        options: [
          { text: "Sí", isCorrect: false },
          { text: "No", isCorrect: true }
        ],
        points: 1
      },
      {
        question: "¿Qué pasa si compartes accesos?",
        type: "multiple_choice",
        options: [
          { text: "Nada", isCorrect: false },
          { text: "Se pierde la trazabilidad y es una infracción", isCorrect: true }
        ],
        points: 1
      },
      {
        question: "¿Qué debes hacer si no necesitas datos?",
        type: "multiple_choice",
        options: [
          { text: "Guardarlos", isCorrect: false },
          { text: "No tenerlos", isCorrect: true }
        ],
        points: 1
      }
    ]
  },
  {
    chapter: "CAPÍTULO 5 – Qué NO hacer con datos",
    questions: [
      {
        question: "¿Puedes usar datos para beneficio personal?",
        type: "multiple_choice",
        options: [
          { text: "Sí", isCorrect: false },
          { text: "No", isCorrect: true }
        ],
        points: 1
      },
      {
        question: "¿Es correcto compartir datos con terceros sin autorización?",
        type: "multiple_choice",
        options: [
          { text: "Sí", isCorrect: false },
          { text: "No", isCorrect: true }
        ],
        points: 1
      },
      {
        question: "¿Acceder a datos por curiosidad está permitido?",
        type: "multiple_choice",
        options: [
          { text: "Sí", isCorrect: false },
          { text: "No", isCorrect: true }
        ],
        points: 1
      },
      {
        question: "¿Qué debes hacer si el uso no está autorizado?",
        type: "multiple_choice",
        options: [
          { text: "Usarlo igual", isCorrect: false },
          { text: "No usarlo", isCorrect: true }
        ],
        points: 1
      }
    ]
  },
  {
    chapter: "CAPÍTULO 6 – Gestión de incidentes",
    questions: [
      {
        question: "¿Qué es un incidente de datos?",
        type: "multiple_choice",
        options: [
          { text: "Algo sin importancia", isCorrect: false },
          { text: "Exposición o uso incorrecto de datos personales", isCorrect: true }
        ],
        points: 1
      },
      {
        question: "¿Qué debes hacer ante un incidente?",
        type: "multiple_choice",
        options: [
          { text: "Ignorarlo", isCorrect: false },
          { text: "Reportarlo de inmediato", isCorrect: true }
        ],
        points: 1
      },
      {
        question: "¿Reportar un error es negativo?",
        type: "multiple_choice",
        options: [
          { text: "Sí", isCorrect: false },
          { text: "No, es parte de la solución", isCorrect: true }
        ],
        points: 1
      },
      {
        question: "¿Qué reduce el impacto de un incidente?",
        type: "multiple_choice",
        options: [
          { text: "Ocultarlo", isCorrect: false },
          { text: "Actuar rápido y reportar", isCorrect: true }
        ],
        points: 1
      }
    ]
  },
  {
    chapter: "CAPÍTULO 7 – Responsabilidad personal",
    questions: [
      {
        question: "¿Quién es responsable de proteger los datos?",
        type: "multiple_choice",
        options: [
          { text: "Solo TI", isCorrect: false },
          { text: "Todos los colaboradores", isCorrect: true }
        ],
        points: 1
      },
      {
        question: "¿Las decisiones diarias pueden generar riesgo?",
        type: "multiple_choice",
        options: [
          { text: "No", isCorrect: false },
          { text: "Sí", isCorrect: true }
        ],
        points: 1
      },
      {
        question: "¿Qué debes hacer si algo no parece correcto?",
        type: "multiple_choice",
        options: [
          { text: "Ignorarlo", isCorrect: false },
          { text: "Cuestionarlo o consultarlo", isCorrect: true }
        ],
        points: 1
      },
      {
        question: "¿Compartir accesos es correcto?",
        type: "multiple_choice",
        options: [
          { text: "Sí", isCorrect: false },
          { text: "No", isCorrect: true }
        ],
        points: 1
      }
    ]
  },
  {
    chapter: "CAPÍTULO 8 – Checklist práctico",
    questions: [
      {
        question: "Antes de usar datos, ¿qué debes preguntarte?",
        type: "multiple_choice",
        options: [
          { text: "Si es fácil", isCorrect: false },
          { text: "Si es necesario para tu trabajo", isCorrect: true }
        ],
        points: 1
      },
      {
        question: "¿Qué debes hacer si no estás seguro del uso?",
        type: "multiple_choice",
        options: [
          { text: "Usarlo igual", isCorrect: false },
          { text: "No usarlo y validar", isCorrect: true }
        ],
        points: 1
      },
      {
        question: "¿Cómo debes trabajar con datos?",
        type: "multiple_choice",
        options: [
          { text: "Fuera del sistema", isCorrect: false },
          { text: "Dentro de sistemas oficiales", isCorrect: true }
        ],
        points: 1
      },
      {
        question: "¿Qué debes hacer ante un error?",
        type: "multiple_choice",
        options: [
          { text: "Ocultarlo", isCorrect: false },
          { text: "Reportarlo", isCorrect: true }
        ],
        points: 1
      }
    ]
  }
];

async function loadPrivacyQuiz() {
  try {
    // Conectar a MongoDB
    await connectDB();
    console.log('✅ Conectado a MongoDB');

    // 1. Buscar o crear el curso de privacidad de datos
    let course = await Course.findOne({ 
      courseTitle: { $regex: /privacidad.*datos/i }
    }).populate('lectures');

    console.log('🔍 Buscando curso de privacidad...');
    
    if (!course) {
      console.log('📝 Creando nuevo curso de Privacidad de Datos...');
      course = await Course.create({
        courseTitle: "Privacidad de Datos",
        category: "Data Governance",
        description: "Curso completo sobre el manejo adecuado de datos personales y privacidad",
        courseLevel: "Beginner",
        coursePrice: 0,
        isPublished: true,
        lectures: []
      });
      console.log('✅ Curso creado:', course._id);
    } else {
      console.log('✅ Curso encontrado:', course._id);
    }

    // 2. Buscar o crear la lecture específica
    let lecture = await Lecture.findOne({
      lectureTitle: { $regex: /¿Qué es un dato personal?/i }
    });

    if (!lecture) {
      console.log('📝 Creando lecture: CAPÍTULO 1 – ¿Qué es un dato personal?');
      lecture = await Lecture.create({
        lectureTitle: "CAPÍTULO 1 – ¿Qué es un dato personal?",
        isPreviewFree: true
      });
      
      // Agregar la lecture al curso si no existe
      if (!course.lectures.includes(lecture._id)) {
        course.lectures.push(lecture._id);
        await course.save();
        console.log('✅ Lecture agregada al curso');
      }
    } else {
      console.log('✅ Lecture encontrada:', lecture._id);
    }

    // 3. Verificar si ya existe un quiz para esta lecture
    const existingQuiz = await Quiz.findOne({ 
      lectureId: lecture._id,
      courseId: course._id 
    });

    if (existingQuiz) {
      console.log('⚠️ Quiz ya existe para esta lecture:', existingQuiz._id);
      console.log('🔄 Eliminando quiz existente para crear uno nuevo...');
      await Quiz.findByIdAndDelete(existingQuiz._id);
    }

    // 4. Combinar todas las preguntas de todos los capítulos
    const allQuestions = [];
    privacyQuizData.forEach((chapter, chapterIndex) => {
      console.log(`📋 Procesando ${chapter.chapter} - ${chapter.questions.length} preguntas`);
      chapter.questions.forEach((question, questionIndex) => {
        allQuestions.push({
          ...question,
          explanation: `Pregunta del ${chapter.chapter}`
        });
      });
    });

    // 5. Crear el quiz completo con todas las preguntas
    console.log(`📝 Creando quiz con ${allQuestions.length} preguntas...`);
    console.log(`🔗 Lecture ID: ${lecture._id}`);
    console.log(`🔗 Course ID: ${course._id}`);
    
    const quizData = {
      lectureId: lecture._id,
      courseId: course._id,
      title: "Quiz Completo - Privacidad de Datos",
      description: "Evaluación completa de todos los capítulos del curso de privacidad de datos",
      questions: allQuestions,
      timeLimit: 30, // 30 minutos
      passingScore: 70,
      maxAttempts: 3,
      isActive: true,
      order: 1
    };
    
    console.log('📋 Datos del quiz a crear:', {
      lectureId: quizData.lectureId,
      courseId: quizData.courseId,
      title: quizData.title,
      questionsCount: quizData.questions.length
    });
    
    const quiz = await Quiz.create(quizData);
    console.log(`💾 Quiz guardado con ID: ${quiz._id}`);

    console.log('✅ Quiz creado exitosamente!');
    console.log('📊 Estadísticas del quiz:');
    console.log(`   - ID del Quiz: ${quiz._id}`);
    console.log(`   - Curso: ${course.courseTitle} (${course._id})`);
    console.log(`   - Lecture: ${lecture.lectureTitle} (${lecture._id})`);
    console.log(`   - Total de preguntas: ${allQuestions.length}`);
    console.log(`   - Capítulos incluidos: ${privacyQuizData.length}`);
    console.log(`   - Tiempo límite: ${quiz.timeLimit} minutos`);
    console.log(`   - Puntaje para aprobar: ${quiz.passingScore}%`);

    // Mostrar resumen por capítulos
    console.log('\n📚 Resumen por capítulos:');
    privacyQuizData.forEach((chapter, index) => {
      console.log(`   ${index + 1}. ${chapter.chapter}: ${chapter.questions.length} preguntas`);
    });

    console.log('\n🎉 ¡Quiz de Privacidad de Datos cargado exitosamente!');
    
  } catch (error) {
    console.error('❌ Error al cargar el quiz:', error);
    console.error(error.stack);
  } finally {
    // Cerrar conexión
    await mongoose.connection.close();
    console.log('🔌 Conexión a MongoDB cerrada');
  }
}

// Ejecutar el script
loadPrivacyQuiz();