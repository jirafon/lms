import dotenv from 'dotenv';
import connectDB from './database/db.js';
import { Course } from './models/course.model.js';
import { Lecture } from './models/lecture.model.js';
import { Quiz } from './models/quiz.model.js';
import mongoose from 'mongoose';

dotenv.config();

// Datos organizados por capítulo - cada uno será una lecture con su quiz
const privacyChapters = [
  {
    title: "CAPÍTULO 1 – ¿Qué es un dato personal?",
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
    title: "CAPÍTULO 2 – Uso correcto de datos",
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
    title: "CAPÍTULO 3 – Consentimiento y finalidad",
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
    title: "CAPÍTULO 4 – Manejo seguro de bases de datos",
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
    title: "CAPÍTULO 5 – Qué NO hacer con datos",
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
    title: "CAPÍTULO 6 – Gestión de incidentes",
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
    title: "CAPÍTULO 7 – Responsabilidad personal",
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
    title: "CAPÍTULO 8 – Checklist práctico",
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

async function createPrivacyCourse() {
  try {
    await connectDB();
    console.log('✅ Conectado a MongoDB');

    // 1. Buscar o crear el curso de privacidad
    let course = await Course.findOne({ 
      courseTitle: { $regex: /privacidad.*datos/i }
    });

    if (!course) {
      console.log('📝 Creando nuevo curso de Privacidad de Datos...');
      course = await Course.create({
        courseTitle: "Privacidad de Datos para Colaboradores",
        category: "Data Privacy",
        description: "Curso completo sobre el manejo adecuado de datos personales y privacidad. Aprende los fundamentos, buenas prácticas y responsabilidades en el manejo de datos personales.",
        courseLevel: "Beginner",
        coursePrice: 0,
        isPublished: true,
        lectures: []
      });
      console.log(`✅ Curso creado: ${course._id}`);
    } else {
      console.log(`✅ Curso encontrado: ${course.courseTitle} (${course._id})`);
      
      // Limpiar lectures y quizzes existentes
      console.log('🧹 Limpiando contenido existente...');
      
      // Eliminar quizzes existentes
      await Quiz.deleteMany({ courseId: course._id });
      
      // Eliminar lectures existentes 
      const existingLectures = course.lectures || [];
      for (const lectureId of existingLectures) {
        await Lecture.findByIdAndDelete(lectureId);
      }
      
      // Limpiar array de lectures del curso
      course.lectures = [];
      await course.save();
      
      console.log('✅ Contenido anterior limpiado');
    }

    console.log(`\n🎬 Creando ${privacyChapters.length} capítulos...`);

    // 2. Crear cada capítulo como lecture + quiz
    for (let i = 0; i < privacyChapters.length; i++) {
      const chapter = privacyChapters[i];
      console.log(`\n📖 Procesando: ${chapter.title}`);

      // Crear lecture para este capítulo
      const lecture = await Lecture.create({
        lectureTitle: chapter.title,
        isPreviewFree: i === 0 // Solo el primer capítulo es preview gratuito
      });

      console.log(`   ✅ Lecture creada: ${lecture._id}`);

      // Agregar lecture al curso
      course.lectures.push(lecture._id);

      // Crear quiz para esta lecture
      const quiz = await Quiz.create({
        lectureId: lecture._id,
        courseId: course._id,
        title: `Quiz - ${chapter.title}`,
        description: `Evaluación de conocimientos para ${chapter.title}`,
        questions: chapter.questions.map(q => ({
          ...q,
          explanation: `Pregunta sobre ${chapter.title}`
        })),
        timeLimit: 5, // 5 minutos por quiz (4 preguntas)
        passingScore: 75, // 75% para aprobar (3 de 4 preguntas)
        maxAttempts: 3,
        isActive: true,
        order: i + 1
      });

      console.log(`   ✅ Quiz creado: ${quiz._id} (${quiz.questions.length} preguntas)`);
    }

    // Guardar el curso con todas las lectures
    await course.save();

    console.log('\n🎉 ¡Curso de Privacidad creado exitosamente!');
    console.log('📊 Resumen final:');
    console.log(`   - Curso: ${course.courseTitle}`);
    console.log(`   - Course ID: ${course._id}`);
    console.log(`   - Total de capítulos (lectures): ${privacyChapters.length}`);
    console.log(`   - Total de quizzes: ${privacyChapters.length}`);
    console.log(`   - Total de preguntas: ${privacyChapters.length * 4}`);

    console.log('\n📚 Estructura del curso:');
    for (let i = 0; i < privacyChapters.length; i++) {
      const chapter = privacyChapters[i];
      console.log(`   ${i + 1}. ${chapter.title}`);
      console.log(`      - Video/Contenido: Lecture`);
      console.log(`      - Quiz: 4 preguntas, 5 min, 75% para aprobar`);
    }

    console.log('\n🎯 Cada estudiante podrá:');
    console.log('   1. Ver el video del capítulo');
    console.log('   2. Tomar el quiz correspondiente');
    console.log('   3. Avanzar al siguiente capítulo');
    console.log('   4. Obtener certificado al completar todo');

  } catch (error) {
    console.error('❌ Error al crear el curso:', error);
    console.error(error.stack);
  } finally {
    await mongoose.connection.close();
    console.log('🔌 Conexión a MongoDB cerrada');
  }
}

createPrivacyCourse();