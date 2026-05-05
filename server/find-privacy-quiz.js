import dotenv from 'dotenv';
import connectDB from './database/db.js';
import { Course } from './models/course.model.js';
import { Lecture } from './models/lecture.model.js';
import { Quiz } from './models/quiz.model.js';
import mongoose from 'mongoose';

dotenv.config();

async function findPrivacyQuiz() {
  try {
    await connectDB();
    console.log('🔍 Buscando quiz de privacidad...');
    
    // Buscar el curso de privacidad
    const course = await Course.findOne({ 
      courseTitle: { $regex: /privacidad/i }
    });
    
    if (course) {
      console.log(`📚 Curso encontrado: ${course.courseTitle} (${course._id})`);
      
      // Buscar quizzes de este curso
      const quizzes = await Quiz.find({ courseId: course._id });
      console.log(`🧪 Quizzes encontrados: ${quizzes.length}`);
      
      if (quizzes.length > 0) {
        const quiz = quizzes[0];
        console.log(`\n✅ Quiz: ${quiz.title}`);
        console.log(`   - ID: ${quiz._id}`);
        console.log(`   - Preguntas: ${quiz.questions.length}`);
        console.log(`   - Lecture ID: ${quiz.lectureId}`);
        
        // Buscar la lecture
        const lecture = await Lecture.findById(quiz.lectureId);
        if (lecture) {
          console.log(`📖 Lecture: ${lecture.lectureTitle}`);
        }
        
        // Mostrar algunas preguntas
        console.log('\n📝 Primeras 3 preguntas:');
        quiz.questions.slice(0, 3).forEach((q, index) => {
          console.log(`\n${index + 1}. ${q.question}`);
          q.options.forEach((opt, optIndex) => {
            const mark = opt.isCorrect ? ' ✅' : '';
            console.log(`   ${String.fromCharCode(97 + optIndex)}) ${opt.text}${mark}`);
          });
        });
        
        return quiz;
      }
    } else {
      console.log('❌ No se encontró curso de privacidad');
    }
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await mongoose.connection.close();
  }
}

findPrivacyQuiz();