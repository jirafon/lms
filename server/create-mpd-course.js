import dotenv from 'dotenv';
import mongoose from 'mongoose';
import connectDB from './database/db.js';
import { Course } from './models/course.model.js';
import { Lecture } from './models/lecture.model.js';
import { Quiz } from './models/quiz.model.js';

dotenv.config();

const courseTitle = 'Modelo de prevencion de delitos para colaboradores';

const chapters = [
  {
    title: 'CAPÍTULO 1 – Introducción al MPD',
    description: 'Introducción al Modelo de Prevencion de Delitos, su propósito dentro de la empresa y el alcance de la Ley 20.393.',
    questions: [
      {
        question: '¿Quién puede ser responsable según la Ley 20.393?',
        type: 'multiple_choice',
        options: [
          { text: 'Solo la persona que comete el delito', isCorrect: false },
          { text: 'La empresa y la persona involucrada', isCorrect: true },
          { text: 'Solo la gerencia', isCorrect: false }
        ],
        points: 1
      },
      {
        question: '¿Qué es el MPD?',
        type: 'multiple_choice',
        options: [
          { text: 'Un documento legal', isCorrect: false },
          { text: 'Un sistema para prevenir delitos dentro de la empresa', isCorrect: true },
          { text: 'Un reglamento opcional', isCorrect: false }
        ],
        points: 1
      },
      {
        question: '¿El MPD aplica solo al área legal?',
        type: 'multiple_choice',
        options: [
          { text: 'Sí', isCorrect: false },
          { text: 'No, aplica a toda la organización', isCorrect: true }
        ],
        points: 1
      },
      {
        question: '¿Cuál es un ejemplo de riesgo?',
        type: 'multiple_choice',
        options: [
          { text: 'Cumplir un proceso', isCorrect: false },
          { text: 'Ofrecer un beneficio indebido para cerrar un negocio', isCorrect: true }
        ],
        points: 1
      }
    ]
  },
  {
    title: 'CAPÍTULO 2 – Rol del colaborador',
    description: 'Explica el rol de cada colaborador en el cumplimiento, los riesgos cotidianos y la importancia de cuestionar o reportar conductas incorrectas.',
    questions: [
      {
        question: '¿Quién es responsable del cumplimiento?',
        type: 'multiple_choice',
        options: [
          { text: 'Solo compliance', isCorrect: false },
          { text: 'Todos los colaboradores', isCorrect: true }
        ],
        points: 1
      },
      {
        question: '¿Cuál es un riesgo común?',
        type: 'multiple_choice',
        options: [
          { text: 'Revisar información', isCorrect: false },
          { text: 'Aceptar un regalo para facilitar una decisión', isCorrect: true }
        ],
        points: 1
      },
      {
        question: '¿Actuar bajo presión puede generar riesgo?',
        type: 'multiple_choice',
        options: [
          { text: 'No', isCorrect: false },
          { text: 'Sí, si se omiten controles', isCorrect: true }
        ],
        points: 1
      },
      {
        question: '¿Qué hacer si ves algo incorrecto?',
        type: 'multiple_choice',
        options: [
          { text: 'Ignorarlo', isCorrect: false },
          { text: 'Reportarlo o cuestionarlo', isCorrect: true }
        ],
        points: 1
      }
    ]
  },
  {
    title: 'CAPÍTULO 3 – Conflictos de interés',
    description: 'Entrega criterios para reconocer conflictos de interés, declararlos a tiempo y evitar participar en decisiones comprometidas.',
    questions: [
      {
        question: '¿Qué es un conflicto de interés?',
        type: 'multiple_choice',
        options: [
          { text: 'Un problema legal directo', isCorrect: false },
          { text: 'Intereses personales que pueden influir en una decisión laboral', isCorrect: true }
        ],
        points: 1
      },
      {
        question: 'Ejemplo de conflicto:',
        type: 'multiple_choice',
        options: [
          { text: 'Elegir proveedor por precio', isCorrect: false },
          { text: 'Elegir proveedor de un familiar sin declararlo', isCorrect: true }
        ],
        points: 1
      },
      {
        question: '¿Qué debes hacer ante un conflicto?',
        type: 'multiple_choice',
        options: [
          { text: 'Ignorarlo', isCorrect: false },
          { text: 'Declararlo y no participar en la decisión', isCorrect: true }
        ],
        points: 1
      },
      {
        question: '¿Aceptar beneficios puede generar riesgo?',
        type: 'multiple_choice',
        options: [
          { text: 'No', isCorrect: false },
          { text: 'Sí, afecta la objetividad', isCorrect: true }
        ],
        points: 1
      }
    ]
  },
  {
    title: 'CAPÍTULO 4 – Uso indebido de recursos',
    description: 'Revisa el uso correcto de recursos, sistemas e información de la empresa y cómo actuar cuando existen dudas sobre una acción.',
    questions: [
      {
        question: '¿Qué es uso indebido?',
        type: 'multiple_choice',
        options: [
          { text: 'Uso correcto', isCorrect: false },
          { text: 'Uso de recursos para fines no autorizados', isCorrect: true }
        ],
        points: 1
      },
      {
        question: 'Ejemplo:',
        type: 'multiple_choice',
        options: [
          { text: 'Usar sistema para trabajo', isCorrect: false },
          { text: 'Usar base de clientes para negocio personal', isCorrect: true }
        ],
        points: 1
      },
      {
        question: '¿El acceso permite uso libre?',
        type: 'multiple_choice',
        options: [
          { text: 'Sí', isCorrect: false },
          { text: 'No', isCorrect: true }
        ],
        points: 1
      },
      {
        question: '¿Qué hacer si tienes dudas?',
        type: 'multiple_choice',
        options: [
          { text: 'Usar igual', isCorrect: false },
          { text: 'Consultar antes de actuar', isCorrect: true }
        ],
        points: 1
      }
    ]
  },
  {
    title: 'CAPÍTULO 5 – Cohecho y sobornos',
    description: 'Describe ejemplos de cohecho y soborno, beneficios indebidos y la responsabilidad que puede recaer sobre la empresa y sus terceros.',
    questions: [
      {
        question: '¿Qué es un soborno?',
        type: 'multiple_choice',
        options: [
          { text: 'Beneficio permitido', isCorrect: false },
          { text: 'Beneficio indebido para influir en una decisión', isCorrect: true }
        ],
        points: 1
      },
      {
        question: 'Ejemplo:',
        type: 'multiple_choice',
        options: [
          { text: 'Evaluar proveedor', isCorrect: false },
          { text: 'Ofrecer regalo para asegurar contrato', isCorrect: true }
        ],
        points: 1
      },
      {
        question: '¿Aceptar beneficios puede ser riesgo?',
        type: 'multiple_choice',
        options: [
          { text: 'No', isCorrect: false },
          { text: 'Sí', isCorrect: true }
        ],
        points: 1
      },
      {
        question: '¿La empresa puede ser responsable por terceros?',
        type: 'multiple_choice',
        options: [
          { text: 'No', isCorrect: false },
          { text: 'Sí', isCorrect: true }
        ],
        points: 1
      }
    ]
  },
  {
    title: 'CAPÍTULO 6 – Relación con terceros',
    description: 'Aborda los riesgos de trabajar con terceros, la evaluación de proveedores y la necesidad de monitoreo cuando actúan en nombre de la empresa.',
    questions: [
      {
        question: '¿Los terceros generan riesgo?',
        type: 'multiple_choice',
        options: [
          { text: 'No', isCorrect: false },
          { text: 'Sí, si actúan en nombre de la empresa', isCorrect: true }
        ],
        points: 1
      },
      {
        question: 'Ejemplo de riesgo:',
        type: 'multiple_choice',
        options: [
          { text: 'Evaluar proveedor', isCorrect: false },
          { text: 'Entregar acceso sin control', isCorrect: true }
        ],
        points: 1
      },
      {
        question: '¿Se debe evaluar a proveedores?',
        type: 'multiple_choice',
        options: [
          { text: 'No', isCorrect: false },
          { text: 'Sí', isCorrect: true }
        ],
        points: 1
      },
      {
        question: '¿Se deben monitorear?',
        type: 'multiple_choice',
        options: [
          { text: 'No', isCorrect: false },
          { text: 'Sí', isCorrect: true }
        ],
        points: 1
      }
    ]
  },
  {
    title: 'CAPÍTULO 7 – Canal de denuncias',
    description: 'Presenta el canal de denuncias como herramienta para reportar riesgos e irregularidades, incluso de forma anónima.',
    questions: [
      {
        question: '¿Para qué sirve el canal?',
        type: 'multiple_choice',
        options: [
          { text: 'Sancionar', isCorrect: false },
          { text: 'Reportar riesgos o irregularidades', isCorrect: true }
        ],
        points: 1
      },
      {
        question: '¿Qué hacer ante irregularidad?',
        type: 'multiple_choice',
        options: [
          { text: 'Ignorar', isCorrect: false },
          { text: 'Reportar', isCorrect: true }
        ],
        points: 1
      },
      {
        question: '¿Puede ser anónimo?',
        type: 'multiple_choice',
        options: [
          { text: 'No', isCorrect: false },
          { text: 'Sí', isCorrect: true }
        ],
        points: 1
      },
      {
        question: '¿No reportar genera riesgo?',
        type: 'multiple_choice',
        options: [
          { text: 'No', isCorrect: false },
          { text: 'Sí', isCorrect: true }
        ],
        points: 1
      }
    ]
  },
  {
    title: 'CAPÍTULO 8 – Qué hacer ante riesgo',
    description: 'Resume las acciones esperadas ante situaciones dudosas: detenerse, validar, consultar y reportar en vez de actuar con apuro.',
    questions: [
      {
        question: '¿Qué hacer si algo genera duda?',
        type: 'multiple_choice',
        options: [
          { text: 'Actuar rápido', isCorrect: false },
          { text: 'Detenerse y validar', isCorrect: true }
        ],
        points: 1
      },
      {
        question: '¿Qué hacer si te piden algo incorrecto?',
        type: 'multiple_choice',
        options: [
          { text: 'Hacerlo', isCorrect: false },
          { text: 'No participar', isCorrect: true }
        ],
        points: 1
      },
      {
        question: '¿Es correcto consultar?',
        type: 'multiple_choice',
        options: [
          { text: 'No', isCorrect: false },
          { text: 'Sí', isCorrect: true }
        ],
        points: 1
      },
      {
        question: '¿Qué hacer ante un riesgo?',
        type: 'multiple_choice',
        options: [
          { text: 'Ignorar', isCorrect: false },
          { text: 'Reportar', isCorrect: true }
        ],
        points: 1
      }
    ]
  },
  {
    title: 'CAPÍTULO 9 – Evaluación final',
    description: 'Evalúa la aplicación práctica de los contenidos del curso mediante situaciones de riesgo frecuentes y decisiones de cumplimiento.',
    questions: [
      {
        question: 'Proveedor ofrece beneficio. ¿Qué haces?',
        type: 'multiple_choice',
        options: [
          { text: 'Aceptar', isCorrect: false },
          { text: 'Rechazar y reportar', isCorrect: true }
        ],
        points: 1
      },
      {
        question: 'Uso indebido de información. ¿Qué haces?',
        type: 'multiple_choice',
        options: [
          { text: 'Usarla', isCorrect: false },
          { text: 'No usarla y consultar', isCorrect: true }
        ],
        points: 1
      },
      {
        question: 'Ves irregularidad. ¿Qué haces?',
        type: 'multiple_choice',
        options: [
          { text: 'Ignorar', isCorrect: false },
          { text: 'Reportar', isCorrect: true }
        ],
        points: 1
      },
      {
        question: 'El cumplimiento depende de:',
        type: 'multiple_choice',
        options: [
          { text: 'La ley', isCorrect: false },
          { text: 'Las decisiones diarias', isCorrect: true }
        ],
        points: 1
      }
    ]
  }
];

async function upsertLecture(course, chapter, index, existingLecturesByTitle) {
  let lecture = existingLecturesByTitle.get(chapter.title);

  if (!lecture) {
    lecture = await Lecture.create({
      lectureTitle: chapter.title,
      lectureDescription: chapter.description,
      lectureOrder: index + 1,
      isPreviewFree: index === 0
    });
    console.log(`   ✅ Lecture creada: ${lecture.lectureTitle} (${lecture._id})`);
  } else {
    lecture.lectureTitle = chapter.title;
    lecture.lectureDescription = chapter.description;
    lecture.lectureOrder = index + 1;
    lecture.isPreviewFree = index === 0;
    await lecture.save();
    console.log(`   ♻️ Lecture actualizada: ${lecture.lectureTitle} (${lecture._id})`);
  }

  let quiz = await Quiz.findOne({ lectureId: lecture._id, courseId: course._id });
  const quizPayload = {
    lectureId: lecture._id,
    courseId: course._id,
    title: `Quiz - ${chapter.title}`,
    description: `Evaluación de conocimientos para ${chapter.title}`,
    questions: chapter.questions.map((question) => ({
      ...question,
      explanation: `Pregunta sobre ${chapter.title}`
    })),
    timeLimit: 5,
    passingScore: 75,
    maxAttempts: 3,
    isActive: true,
    order: index + 1
  };

  if (!quiz) {
    quiz = await Quiz.create(quizPayload);
    console.log(`   ✅ Quiz creado: ${quiz.title} (${quiz._id})`);
  } else {
    Object.assign(quiz, quizPayload);
    await quiz.save();
    console.log(`   ♻️ Quiz actualizado: ${quiz.title} (${quiz._id})`);
  }

  return lecture._id;
}

async function createOrUpdateMpdCourse() {
  try {
    await connectDB();
    console.log('✅ Conectado a MongoDB');

    const defaultCreatorCourse = await Course.findOne({
      creator: { $exists: true, $ne: null }
    }).select('creator');

    const creatorId = process.env.SEED_COURSE_CREATOR_ID || defaultCreatorCourse?.creator;

    if (!creatorId) {
      throw new Error('No se pudo determinar un creator para el curso seed');
    }

    let course = await Course.findOne({
      courseTitle: { $regex: new RegExp(`^${courseTitle}$`, 'i') }
    }).populate('lectures');

    if (!course) {
      course = await Course.create({
        courseTitle,
        subTitle: 'Curso base de cumplimiento para colaboradores',
        category: 'Compliance',
        description: 'Curso para colaboradores sobre modelo de prevencion de delitos, riesgos, controles y reporte de irregularidades.',
        courseLevel: 'Beginner',
        coursePrice: 29,
        creator: creatorId,
        isPublished: true,
        lectures: []
      });
      course = await Course.findById(course._id).populate('lectures');
      console.log(`✅ Curso creado: ${course.courseTitle} (${course._id})`);
    } else {
      course.category = 'Compliance';
      course.subTitle = 'Curso base de cumplimiento para colaboradores';
      course.description = 'Curso para colaboradores sobre modelo de prevencion de delitos, riesgos, controles y reporte de irregularidades.';
      course.courseLevel = 'Beginner';
      course.coursePrice = 29;
      course.creator = course.creator || creatorId;
      course.isPublished = true;
      console.log(`✅ Curso encontrado: ${course.courseTitle} (${course._id})`);
    }

    const existingLecturesByTitle = new Map(
      (course.lectures || []).map((lecture) => [lecture.lectureTitle, lecture])
    );

    const orderedLectureIds = [];

    console.log(`🎬 Sincronizando ${chapters.length} capítulos...`);
    for (let index = 0; index < chapters.length; index += 1) {
      const chapter = chapters[index];
      console.log(`\n📖 ${chapter.title}`);
      const lectureId = await upsertLecture(course, chapter, index, existingLecturesByTitle);
      orderedLectureIds.push(lectureId);
    }

    course.lectures = orderedLectureIds;
    await course.save();

    const totalQuizzes = await Quiz.countDocuments({ courseId: course._id, isActive: true });
    console.log('\n🎉 Curso sincronizado correctamente');
    console.log(`   - Curso: ${course.courseTitle}`);
    console.log(`   - ID: ${course._id}`);
    console.log(`   - Capítulos: ${course.lectures.length}`);
    console.log(`   - Quizzes activos: ${totalQuizzes}`);
    console.log(`   - Preguntas cargadas: ${chapters.length * 4}`);
  } catch (error) {
    console.error('❌ Error al sincronizar el curso MPD:', error);
    console.error(error.stack);
    process.exitCode = 1;
  } finally {
    await mongoose.connection.close();
    console.log('🔌 Conexión cerrada');
  }
}

createOrUpdateMpdCourse();