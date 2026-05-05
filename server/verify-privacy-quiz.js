import dotenv from 'dotenv';
import connectDB from './database/db.js';
import { Course } from './models/course.model.js';
import { Lecture } from './models/lecture.model.js';
import { Quiz } from './models/quiz.model.js';
import mongoose from 'mongoose';

dotenv.config();

async function verifyPrivacyQuiz() {
  try {
    await connectDB();
    console.log('✅ Conectado a MongoDB para verificación');

    // Buscar el curso
    const course = await Course.findById('69f8dc459d0ba24e4f1b322b')
      .populate('lectures');
    
    if (course) {
      console.log('📚 Curso encontrado:');
      console.log(`   - Título: ${course.courseTitle}`);
      console.log(`   - ID: ${course._id}`);
      console.log(`   - Categoría: ${course.category}`);
      console.log(`   - Lectures: ${course.lectures.length}`);
    }

    // Buscar la lecture creada
    const lecture = await Lecture.findById('69f8e40369f0c36fe68baad2');
    if (lecture) {
      console.log('📖 Lecture encontrada:');
      console.log(`   - Título: ${lecture.lectureTitle}`);
      console.log(`   - ID: ${lecture._id}`);
      console.log(`   - Vista previa gratuita: ${lecture.isPreviewFree}`);
    }

    // Buscar el quiz creado
    const quiz = await Quiz.findById('69f8e40369f0c36fe68baad6');
    if (quiz) {
      console.log('🧪 Quiz encontrado:');
      console.log(`   - Título: ${quiz.title}`);
      console.log(`   - ID: ${quiz._id}`);
      console.log(`   - Lecture ID: ${quiz.lectureId}`);
      console.log(`   - Course ID: ${quiz.courseId}`);
      console.log(`   - Total preguntas: ${quiz.questions.length}`);
      console.log(`   - Tiempo límite: ${quiz.timeLimit} minutos`);
      console.log(`   - Puntaje para aprobar: ${quiz.passingScore}%`);
      console.log(`   - Máximo intentos: ${quiz.maxAttempts}`);
      console.log(`   - Activo: ${quiz.isActive}`);
      
      // Mostrar algunas preguntas de muestra
      console.log('\n📝 Muestra de preguntas (primeras 3):');
      quiz.questions.slice(0, 3).forEach((q, index) => {
        console.log(`   ${index + 1}. ${q.question}`);
        q.options.forEach((opt, optIndex) => {
          const mark = opt.isCorrect ? ' ✅' : '';
          console.log(`      ${String.fromCharCode(97 + optIndex)}) ${opt.text}${mark}`);
        });
        console.log('');
      });
    }

    // Verificar que la lecture esté en el curso
    const lectureInCourse = course.lectures.find(l => 
      l._id.toString() === lecture._id.toString()
    );
    
    if (lectureInCourse) {
      console.log('✅ La lecture está correctamente asociada al curso');
    } else {
      console.log('❌ La lecture NO está asociada al curso');
    }

    console.log('\n🎯 Resumen de verificación:');
    console.log(`✅ Curso: ${course ? 'OK' : 'FALTA'}`);
    console.log(`✅ Lecture: ${lecture ? 'OK' : 'FALTA'}`);
    console.log(`✅ Quiz: ${quiz ? 'OK' : 'FALTA'}`);
    console.log(`✅ Asociación Lecture-Curso: ${lectureInCourse ? 'OK' : 'FALTA'}`);
    console.log(`✅ Quiz con ${quiz?.questions?.length || 0} preguntas: ${quiz?.questions?.length === 32 ? 'OK' : 'REVISAR'}`);

  } catch (error) {
    console.error('❌ Error en verificación:', error);
  } finally {
    await mongoose.connection.close();
    console.log('🔌 Conexión cerrada');
  }
}

verifyPrivacyQuiz();