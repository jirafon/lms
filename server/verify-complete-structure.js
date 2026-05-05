import dotenv from 'dotenv';
import connectDB from './database/db.js';
import { Course } from './models/course.model.js';
import { Lecture } from './models/lecture.model.js';
import { Quiz } from './models/quiz.model.js';
import mongoose from 'mongoose';

dotenv.config();

async function verifyPrivacyCourseStructure() {
  try {
    await connectDB();
    console.log('✅ Conectado a MongoDB para verificación completa');

    // Buscar el curso de privacidad
    const course = await Course.findById('69f8dc459d0ba24e4f1b322b')
      .populate('lectures');
    
    if (!course) {
      console.log('❌ Curso no encontrado');
      return;
    }

    console.log('📚 CURSO DE PRIVACIDAD');
    console.log('=' * 50);
    console.log(`Título: ${course.courseTitle}`);
    console.log(`ID: ${course._id}`);
    console.log(`Categoría: ${course.category}`);
    console.log(`Lectures: ${course.lectures.length}`);
    console.log(`Publicado: ${course.isPublished}`);

    // Verificar todas las lectures
    console.log('\n📖 LECTURES:');
    for (let i = 0; i < course.lectures.length; i++) {
      const lecture = course.lectures[i];
      console.log(`\n   ${i + 1}. ${lecture.lectureTitle}`);
      console.log(`      - ID: ${lecture._id}`);
      console.log(`      - Preview gratuito: ${lecture.isPreviewFree}`);

      // Buscar quiz para esta lecture
      const quiz = await Quiz.findOne({ 
        lectureId: lecture._id,
        courseId: course._id 
      });

      if (quiz) {
        console.log(`      ✅ Quiz encontrado: ${quiz.title}`);
        console.log(`         - Quiz ID: ${quiz._id}`);
        console.log(`         - Preguntas: ${quiz.questions.length}`);
        console.log(`         - Tiempo límite: ${quiz.timeLimit} min`);
        console.log(`         - Puntaje mínimo: ${quiz.passingScore}%`);
        console.log(`         - Orden: ${quiz.order}`);
      } else {
        console.log(`      ❌ Quiz NO encontrado`);
      }
    }

    // Obtener estadísticas generales
    const totalQuizzes = await Quiz.countDocuments({ 
      courseId: course._id,
      isActive: true 
    });

    console.log('\n📊 ESTADÍSTICAS GENERALES:');
    console.log(`   - Total lectures: ${course.lectures.length}`);
    console.log(`   - Total quizzes: ${totalQuizzes}`);
    console.log(`   - Estructura 1:1: ${course.lectures.length === totalQuizzes ? 'SÍ ✅' : 'NO ❌'}`);

    // Test de API endpoints
    console.log('\n🧪 TEST DE ENDPOINTS:');

    // 1. Obtener todos los quizzes del curso
    const allQuizzes = await Quiz.find({ 
      courseId: course._id,
      isActive: true 
    }).populate('lectureId', 'lectureTitle').sort({ order: 1 });

    console.log(`   📋 GET /quiz/course/${course._id}: ${allQuizzes.length} quizzes encontrados`);

    // 2. Probar obtener quiz por lecture para cada lecture
    for (let i = 0; i < course.lectures.length; i++) {
      const lecture = course.lectures[i];
      const lectureQuiz = await Quiz.findOne({ 
        lectureId: lecture._id,
        isActive: true 
      });

      console.log(`   📋 GET /quiz/lecture/${lecture._id}: ${lectureQuiz ? 'Quiz encontrado ✅' : 'Quiz no encontrado ❌'}`);
    }

    console.log('\n🎯 RESUMEN FINAL:');
    const allGood = course.lectures.length === totalQuizzes && totalQuizzes === 8;
    console.log(`   - Estructura completa: ${allGood ? '✅ PERFECTA' : '❌ REVISAR'}`);
    console.log(`   - 8 capítulos con lecture + quiz: ${allGood ? 'SÍ' : 'NO'}`);
    
    if (allGood) {
      console.log('\n🎉 ¡El curso está perfectamente estructurado!');
      console.log('📱 Debería ser visible en el frontend ahora');
    } else {
      console.log('\n⚠️ Hay problemas en la estructura que deben resolverse');
    }

  } catch (error) {
    console.error('❌ Error en verificación:', error);
  } finally {
    await mongoose.connection.close();
    console.log('\n🔌 Conexión cerrada');
  }
}

verifyPrivacyCourseStructure();