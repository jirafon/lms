import dotenv from 'dotenv';
import connectDB from './database/db.js';
import { Quiz } from './models/quiz.model.js';
import mongoose from 'mongoose';

dotenv.config();

async function showQuizDetails() {
  try {
    await connectDB();
    
    const quiz = await Quiz.findById('69f8e40369f0c36fe68baad6');
    
    if (quiz) {
      console.log('📚 QUIZ COMPLETO DE PRIVACIDAD DE DATOS');
      console.log('=' * 50);
      console.log(`Título: ${quiz.title}`);
      console.log(`Total de preguntas: ${quiz.questions.length}`);
      console.log(`Tiempo límite: ${quiz.timeLimit} minutos`);
      console.log(`Puntaje mínimo: ${quiz.passingScore}%`);
      console.log('=' * 50);

      // Organizar preguntas por capítulos basándose en los bloques de 4
      const chapters = [
        'CAPÍTULO 1 – ¿Qué es un dato personal?',
        'CAPÍTULO 2 – Uso correcto de datos', 
        'CAPÍTULO 3 – Consentimiento y finalidad',
        'CAPÍTULO 4 – Manejo seguro de bases de datos',
        'CAPÍTULO 5 – Qué NO hacer con datos',
        'CAPÍTULO 6 – Gestión de incidentes',
        'CAPÍTULO 7 – Responsabilidad personal',
        'CAPÍTULO 8 – Checklist práctico'
      ];

      let questionIndex = 0;
      
      chapters.forEach((chapterTitle, chapterIndex) => {
        console.log(`\n🧪 ${chapterTitle}`);
        console.log('-'.repeat(chapterTitle.length + 3));
        
        // Mostrar 4 preguntas por capítulo
        for (let i = 0; i < 4; i++) {
          const question = quiz.questions[questionIndex];
          if (question) {
            console.log(`\nPregunta ${i + 1}:`);
            console.log(`${question.question}`);
            console.log('');
            
            question.options.forEach((option, optIndex) => {
              const marker = option.isCorrect ? ' ✅' : '';
              console.log(`${option.text}${marker}`);
            });
            
            questionIndex++;
          }
        }
      });
      
      console.log('\n🎉 ¡Quiz cargado exitosamente en MongoDB!');
      console.log('\n📍 Información de ubicación:');
      console.log(`- Course ID: ${quiz.courseId}`);
      console.log(`- Lecture ID: ${quiz.lectureId}`);
      console.log(`- Quiz ID: ${quiz._id}`);
      
    } else {
      console.log('❌ Quiz no encontrado');
    }
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await mongoose.connection.close();
  }
}

showQuizDetails();