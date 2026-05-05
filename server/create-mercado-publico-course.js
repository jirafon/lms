import dotenv from 'dotenv';
import mongoose from 'mongoose';
import connectDB from './database/db.js';
import { Course } from './models/course.model.js';
import { Lecture } from './models/lecture.model.js';
import { Quiz } from './models/quiz.model.js';

dotenv.config();

const courseTitle = 'Integridad para Mercado Publico';

const chapters = [
  {
    title: 'CAPÍTULO 1 – Introducción a la integridad',
    description: 'Introduce las exigencias de integridad en el Mercado Público, las consecuencias del incumplimiento y la responsabilidad de quienes participan en el proceso.',
    questions: [
      {
        question: '¿Qué implica participar en el Mercado Público?',
        type: 'multiple_choice',
        options: [
          { text: 'Solo vender productos', isCorrect: false },
          { text: 'Cumplir estándares de transparencia e integridad', isCorrect: true }
        ],
        points: 1
      },
      {
        question: '¿Cuál es una conducta incorrecta?',
        type: 'multiple_choice',
        options: [
          { text: 'Presentar una oferta', isCorrect: false },
          { text: 'Contactar a un funcionario fuera del proceso formal para obtener ventaja', isCorrect: true }
        ],
        points: 1
      },
      {
        question: '¿Qué puede ocurrir si no se cumplen las reglas?',
        type: 'multiple_choice',
        options: [
          { text: 'Nada', isCorrect: false },
          { text: 'Sanciones y exclusión de licitaciones', isCorrect: true }
        ],
        points: 1
      },
      {
        question: '¿Quién es responsable de actuar con integridad?',
        type: 'multiple_choice',
        options: [
          { text: 'Solo la empresa', isCorrect: false },
          { text: 'Todos los colaboradores involucrados', isCorrect: true }
        ],
        points: 1
      }
    ]
  },
  {
    title: 'CAPÍTULO 2 – Transparencia e igualdad',
    description: 'Explica cómo deben resguardarse la igualdad de condiciones, el uso exclusivo de información oficial y la veracidad de las ofertas.',
    questions: [
      {
        question: '¿Qué significa igualdad en licitaciones?',
        type: 'multiple_choice',
        options: [
          { text: 'Todos compiten con las mismas condiciones e información', isCorrect: true },
          { text: 'Algunas empresas tienen ventajas', isCorrect: false }
        ],
        points: 1
      },
      {
        question: '¿Cuál es un riesgo?',
        type: 'multiple_choice',
        options: [
          { text: 'Usar información pública', isCorrect: false },
          { text: 'Tener información antes que otros participantes', isCorrect: true }
        ],
        points: 1
      },
      {
        question: '¿Es correcto contactar a funcionarios fuera de canales oficiales?',
        type: 'multiple_choice',
        options: [
          { text: 'Sí', isCorrect: false },
          { text: 'No', isCorrect: true }
        ],
        points: 1
      },
      {
        question: '¿Qué deben reflejar las ofertas?',
        type: 'multiple_choice',
        options: [
          { text: 'Información estimada', isCorrect: false },
          { text: 'Información real y verificable', isCorrect: true }
        ],
        points: 1
      }
    ]
  },
  {
    title: 'CAPÍTULO 3 – Conflictos de interés',
    description: 'Desarrolla cómo reconocer relaciones o intereses personales que afectan la objetividad y qué hacer para proteger a la persona y a la empresa.',
    questions: [
      {
        question: '¿Qué es un conflicto de interés?',
        type: 'multiple_choice',
        options: [
          { text: 'Una política', isCorrect: false },
          { text: 'Intereses personales que influyen en decisiones laborales', isCorrect: true }
        ],
        points: 1
      },
      {
        question: 'Ejemplo:',
        type: 'multiple_choice',
        options: [
          { text: 'Evaluar oferta', isCorrect: false },
          { text: 'Tener relación con funcionario y no declararlo', isCorrect: true }
        ],
        points: 1
      },
      {
        question: '¿Qué hacer ante un conflicto?',
        type: 'multiple_choice',
        options: [
          { text: 'Ignorarlo', isCorrect: false },
          { text: 'Declararlo y abstenerse de participar', isCorrect: true }
        ],
        points: 1
      },
      {
        question: '¿Declarar protege?',
        type: 'multiple_choice',
        options: [
          { text: 'No', isCorrect: false },
          { text: 'Sí, protege a la persona y la empresa', isCorrect: true }
        ],
        points: 1
      }
    ]
  },
  {
    title: 'CAPÍTULO 4 – Cohecho y beneficios indebidos',
    description: 'Detalla conductas de cohecho, regalos o invitaciones indebidas y el riesgo que pueden generar también a través de terceros.',
    questions: [
      {
        question: '¿Qué es cohecho?',
        type: 'multiple_choice',
        options: [
          { text: 'Un acuerdo comercial', isCorrect: false },
          { text: 'Dar o recibir beneficios para influir en decisiones', isCorrect: true }
        ],
        points: 1
      },
      {
        question: 'Ejemplo:',
        type: 'multiple_choice',
        options: [
          { text: 'Presentar propuesta', isCorrect: false },
          { text: 'Ofrecer regalo para asegurar adjudicación', isCorrect: true }
        ],
        points: 1
      },
      {
        question: '¿Invitaciones pueden generar riesgo?',
        type: 'multiple_choice',
        options: [
          { text: 'No', isCorrect: false },
          { text: 'Sí, si influyen en decisiones', isCorrect: true }
        ],
        points: 1
      },
      {
        question: '¿Terceros pueden generar riesgo?',
        type: 'multiple_choice',
        options: [
          { text: 'No', isCorrect: false },
          { text: 'Sí, si actúan en nombre de la empresa', isCorrect: true }
        ],
        points: 1
      }
    ]
  },
  {
    title: 'CAPÍTULO 5 – Colusión',
    description: 'Revisa prácticas de colusión entre competidores y refuerza la obligación de competir de manera completamente independiente.',
    questions: [
      {
        question: '¿Qué es colusión?',
        type: 'multiple_choice',
        options: [
          { text: 'Competir libremente', isCorrect: false },
          { text: 'Acordar resultados entre empresas', isCorrect: true }
        ],
        points: 1
      },
      {
        question: 'Ejemplo:',
        type: 'multiple_choice',
        options: [
          { text: 'Presentar oferta independiente', isCorrect: false },
          { text: 'Coordinar precios con competidores', isCorrect: true }
        ],
        points: 1
      },
      {
        question: '¿Compartir información con competidores es correcto?',
        type: 'multiple_choice',
        options: [
          { text: 'Sí', isCorrect: false },
          { text: 'No', isCorrect: true }
        ],
        points: 1
      },
      {
        question: '¿Qué debe hacer cada empresa?',
        type: 'multiple_choice',
        options: [
          { text: 'Coordinar', isCorrect: false },
          { text: 'Competir de forma independiente', isCorrect: true }
        ],
        points: 1
      }
    ]
  },
  {
    title: 'CAPÍTULO 6 – Información privilegiada',
    description: 'Define qué es información privilegiada en licitaciones y por qué solo puede utilizarse información pública y oficial.',
    questions: [
      {
        question: '¿Qué es información privilegiada?',
        type: 'multiple_choice',
        options: [
          { text: 'Información pública', isCorrect: false },
          { text: 'Información no disponible para todos los participantes', isCorrect: true }
        ],
        points: 1
      },
      {
        question: 'Ejemplo:',
        type: 'multiple_choice',
        options: [
          { text: 'Bases publicadas', isCorrect: false },
          { text: 'Conocer condiciones antes de publicación oficial', isCorrect: true }
        ],
        points: 1
      },
      {
        question: '¿Se puede usar información obtenida informalmente?',
        type: 'multiple_choice',
        options: [
          { text: 'Sí', isCorrect: false },
          { text: 'No', isCorrect: true }
        ],
        points: 1
      },
      {
        question: '¿Qué tipo de información debes usar?',
        type: 'multiple_choice',
        options: [
          { text: 'Interna', isCorrect: false },
          { text: 'Solo la pública y oficial', isCorrect: true }
        ],
        points: 1
      }
    ]
  },
  {
    title: 'CAPÍTULO 7 – Conducta en licitación',
    description: 'Refuerza las reglas de conducta durante el proceso: comunicaciones formales, información veraz y respeto por plazos y procedimientos.',
    questions: [
      {
        question: '¿Cómo deben hacerse las comunicaciones?',
        type: 'multiple_choice',
        options: [
          { text: 'Por canales personales', isCorrect: false },
          { text: 'Por canales formales del proceso', isCorrect: true }
        ],
        points: 1
      },
      {
        question: '¿Qué es incorrecto?',
        type: 'multiple_choice',
        options: [
          { text: 'Presentar información real', isCorrect: false },
          { text: 'Exagerar capacidades de la empresa', isCorrect: true }
        ],
        points: 1
      },
      {
        question: '¿Se deben respetar plazos?',
        type: 'multiple_choice',
        options: [
          { text: 'No', isCorrect: false },
          { text: 'Sí', isCorrect: true }
        ],
        points: 1
      },
      {
        question: '¿Qué asegura una buena conducta?',
        type: 'multiple_choice',
        options: [
          { text: 'Flexibilidad', isCorrect: false },
          { text: 'Respeto de reglas y procesos', isCorrect: true }
        ],
        points: 1
      }
    ]
  },
  {
    title: 'CAPÍTULO 8 – Qué hacer ante irregularidades',
    description: 'Entrega criterios de acción frente a señales de irregularidad: detenerse, analizar, no participar y reportar oportunamente.',
    questions: [
      {
        question: '¿Qué hacer si algo parece incorrecto?',
        type: 'multiple_choice',
        options: [
          { text: 'Ignorarlo', isCorrect: false },
          { text: 'Analizarlo y no participar', isCorrect: true }
        ],
        points: 1
      },
      {
        question: '¿Se debe usar información dudosa?',
        type: 'multiple_choice',
        options: [
          { text: 'Sí', isCorrect: false },
          { text: 'No', isCorrect: true }
        ],
        points: 1
      },
      {
        question: '¿Qué hacer ante una irregularidad?',
        type: 'multiple_choice',
        options: [
          { text: 'No hacer nada', isCorrect: false },
          { text: 'Reportarla', isCorrect: true }
        ],
        points: 1
      },
      {
        question: '¿Cuál es la regla final?',
        type: 'multiple_choice',
        options: [
          { text: 'Actuar rápido', isCorrect: false },
          { text: 'Si algo no parece correcto, no hacerlo', isCorrect: true }
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
      isPreviewFree: index === 0
    });
    console.log(`   ✅ Lecture creada: ${lecture.lectureTitle} (${lecture._id})`);
  } else {
    lecture.lectureTitle = chapter.title;
    lecture.lectureDescription = chapter.description;
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

async function createOrUpdateMercadoPublicoCourse() {
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
        subTitle: 'Curso de integridad y cumplimiento para licitaciones',
        category: 'Compliance',
        description: 'Curso para colaboradores sobre integridad, transparencia y prevención de riesgos en procesos de Mercado Público.',
        courseLevel: 'Beginner',
        coursePrice: 0,
        creator: creatorId,
        isPublished: true,
        lectures: []
      });
      course = await Course.findById(course._id).populate('lectures');
      console.log(`✅ Curso creado: ${course.courseTitle} (${course._id})`);
    } else {
      course.subTitle = 'Curso de integridad y cumplimiento para licitaciones';
      course.category = 'Compliance';
      course.description = 'Curso para colaboradores sobre integridad, transparencia y prevención de riesgos en procesos de Mercado Público.';
      course.courseLevel = 'Beginner';
      course.coursePrice = 0;
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
    console.error('❌ Error al sincronizar el curso Mercado Publico:', error);
    console.error(error.stack);
    process.exitCode = 1;
  } finally {
    await mongoose.connection.close();
    console.log('🔌 Conexión cerrada');
  }
}

createOrUpdateMercadoPublicoCourse();