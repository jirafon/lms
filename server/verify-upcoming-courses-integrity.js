import dotenv from 'dotenv';
import mongoose from 'mongoose';
import connectDB from './database/db.js';
import { Course } from './models/course.model.js';
import { Lecture } from './models/lecture.model.js';
import { upcomingCourses, escapeRegExp, getCourseChapterList } from './seeds/upcomingCoursesCatalog.js';

dotenv.config();

const descriptionHasChapters = (description = '') => /Capitulos planificados|Capitulo\s+\d+/i.test(description);

async function verifyUpcomingCoursesIntegrity() {
  try {
    await connectDB();
    console.log('✅ Conectado a MongoDB');

    const failures = [];

    for (const courseSeed of upcomingCourses) {
      const titleRegex = new RegExp(`^${escapeRegExp(courseSeed.courseTitle)}$`, 'i');
      const course = await Course.findOne({ courseTitle: { $regex: titleRegex } }).populate('lectures');

      if (!course) {
        failures.push(`Curso no encontrado: ${courseSeed.courseTitle}`);
        continue;
      }

      if (descriptionHasChapters(course.description)) {
        failures.push(`Descripcion incluye capitulos: ${course.courseTitle}`);
      }

      const expectedChapters = getCourseChapterList(courseSeed);
      const expectedTitles = expectedChapters.map((chapter) => chapter.title);
      const currentLectures = Array.isArray(course.lectures) ? course.lectures : [];

      if (currentLectures.length !== expectedTitles.length) {
        failures.push(
          `Cantidad de lectures invalida en ${course.courseTitle}: esperado=${expectedTitles.length}, actual=${currentLectures.length}`
        );
      }

      const currentTitles = currentLectures.map((lecture) => lecture.lectureTitle);
      for (let i = 0; i < expectedTitles.length; i += 1) {
        if (currentTitles[i] !== expectedTitles[i]) {
          failures.push(
            `Orden/titulo de lectures invalido en ${course.courseTitle} (posicion ${i + 1}): esperado="${expectedTitles[i]}", actual="${currentTitles[i] || 'N/A'}"`
          );
        }
      }

      for (const lecture of currentLectures) {
        if (!(lecture instanceof Lecture)) {
          failures.push(`Lecture no poblada correctamente en ${course.courseTitle}`);
          break;
        }
      }
    }

    if (failures.length > 0) {
      console.error('\n❌ Verificacion de cursos proximos fallida');
      for (const failure of failures) {
        console.error(` - ${failure}`);
      }
      process.exitCode = 1;
      return;
    }

    console.log('\n✅ Verificacion de cursos proximos aprobada');
    console.log(`   - Cursos validados: ${upcomingCourses.length}`);
    console.log('   - Descripciones: sin capitulos incrustados');
    console.log('   - Lectures: cantidad y orden correctos');
  } catch (error) {
    console.error('❌ Error durante verificacion de cursos proximos:', error);
    console.error(error.stack);
    process.exitCode = 1;
  } finally {
    await mongoose.connection.close();
    console.log('🔌 Conexion cerrada');
  }
}

verifyUpcomingCoursesIntegrity();