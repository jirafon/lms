import dotenv from 'dotenv';
import mongoose from 'mongoose';
import connectDB from './database/db.js';
import { Course } from './models/course.model.js';
import { Lecture } from './models/lecture.model.js';
import { upcomingCourses, escapeRegExp, getCourseChapterList } from './seeds/upcomingCoursesCatalog.js';

dotenv.config();

const applyChanges = process.env.APPLY_CHAPTERS === 'true';

async function syncCourseLecturesFromModules() {
  try {
    await connectDB();
    console.log('✅ Conectado a MongoDB');

    if (!applyChanges) {
      console.log('ℹ️ Modo dry-run activo. Para aplicar cambios usa: APPLY_CHAPTERS=true npm run seed:upcoming:chapters');
    }

    let processedCourses = 0;
    let createdLectures = 0;
    let updatedLectures = 0;

    for (const courseSeed of upcomingCourses) {
      const titleRegex = new RegExp(`^${escapeRegExp(courseSeed.courseTitle)}$`, 'i');
      const course = await Course.findOne({ courseTitle: { $regex: titleRegex } }).populate('lectures');

      if (!course) {
        console.log(`⚠️ Curso no encontrado, omitido: ${courseSeed.courseTitle}`);
        continue;
      }

      processedCourses += 1;
      const existingByTitle = new Map((course.lectures || []).map((lecture) => [lecture.lectureTitle, lecture]));
      const orderedLectureIds = [];
      const chapters = getCourseChapterList(courseSeed);

      console.log(`\n📘 ${course.courseTitle}`);

      for (let index = 0; index < chapters.length; index += 1) {
        const chapter = chapters[index];
        const chapterTitle = chapter.title;
        const topicSummary = (chapter.topics || []).map((topic) => `- ${topic}`).join('\n');
        const chapterDescription = topicSummary
          ? `Temas del capitulo:\n${topicSummary}`
          : `Capitulo ${index + 1}: ${chapterTitle}`;
        const existingLecture = existingByTitle.get(chapterTitle);

        if (!existingLecture) {
          if (applyChanges) {
            const newLecture = await Lecture.create({
              lectureTitle: chapterTitle,
              lectureDescription: chapterDescription,
              lectureOrder: index + 1,
              isPreviewFree: index === 0
            });
            orderedLectureIds.push(newLecture._id);
            createdLectures += 1;
            console.log(`✅ Lecture creada: ${chapterTitle}`);
          } else {
            console.log(`🧪 [dry-run] Se crearia lecture: ${chapterTitle}`);
          }
        } else {
          if (applyChanges) {
            existingLecture.lectureTitle = chapterTitle;
            existingLecture.lectureDescription = chapterDescription;
            existingLecture.lectureOrder = index + 1;
            existingLecture.isPreviewFree = index === 0;
            await existingLecture.save();
            orderedLectureIds.push(existingLecture._id);
            updatedLectures += 1;
            console.log(`♻️ Lecture actualizada: ${chapterTitle}`);
          } else {
            console.log(`🧪 [dry-run] Se actualizaria lecture: ${chapterTitle}`);
          }
        }
      }

      if (applyChanges) {
        course.lectures = orderedLectureIds;
        await course.save();
      }
    }

    console.log('\n🎉 Sincronizacion de capitulos finalizada');
    console.log(`   - Cursos procesados: ${processedCourses}`);
    console.log(`   - Lectures creadas: ${createdLectures}`);
    console.log(`   - Lectures actualizadas: ${updatedLectures}`);
    console.log(`   - Modo: ${applyChanges ? 'aplicado' : 'dry-run'}`);
  } catch (error) {
    console.error('❌ Error al sincronizar capitulos de cursos proximos:', error);
    console.error(error.stack);
    process.exitCode = 1;
  } finally {
    await mongoose.connection.close();
    console.log('🔌 Conexion cerrada');
  }
}

syncCourseLecturesFromModules();