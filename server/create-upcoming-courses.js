import dotenv from 'dotenv';
import mongoose from 'mongoose';
import connectDB from './database/db.js';
import { Course } from './models/course.model.js';
import {
  UPCOMING_BADGE,
  upcomingCourses,
  escapeRegExp,
  buildUpcomingDescription
} from './seeds/upcomingCoursesCatalog.js';

dotenv.config();

async function createOrUpdateUpcomingCourses() {
  try {
    await connectDB();
    console.log('✅ Conectado a MongoDB');

    const defaultCreatorCourse = await Course.findOne({
      creator: { $exists: true, $ne: null }
    }).select('creator');

    const creatorId = process.env.SEED_COURSE_CREATOR_ID || defaultCreatorCourse?.creator;

    if (!creatorId) {
      throw new Error('No se pudo determinar un creator para el seed de cursos proximos');
    }

    let createdCount = 0;
    let updatedCount = 0;

    for (const item of upcomingCourses) {
      const titleRegex = new RegExp(`^${escapeRegExp(item.courseTitle)}$`, 'i');
      let course = await Course.findOne({ courseTitle: { $regex: titleRegex } });

      const payload = {
        courseTitle: item.courseTitle,
        subTitle: UPCOMING_BADGE,
        category: item.category,
        description: buildUpcomingDescription(item),
        courseLevel: 'Beginner',
        coursePrice: 0,
        quoteOnly: true,
        creator: course?.creator || creatorId,
        isPublished: true
      };

      if (!course) {
        course = await Course.create({
          ...payload,
          lectures: []
        });
        createdCount += 1;
        console.log(`✅ Curso creado: ${course.courseTitle} (${course._id})`);
      } else {
        Object.assign(course, payload);
        await course.save();
        updatedCount += 1;
        console.log(`♻️ Curso actualizado: ${course.courseTitle} (${course._id})`);
      }
    }

    console.log('\n🎉 Seed de cursos proximamente disponibles completado');
    console.log(`   - Total procesados: ${upcomingCourses.length}`);
    console.log(`   - Creados: ${createdCount}`);
    console.log(`   - Actualizados: ${updatedCount}`);
  } catch (error) {
    console.error('❌ Error al crear/actualizar cursos proximos:', error);
    console.error(error.stack);
    process.exitCode = 1;
  } finally {
    await mongoose.connection.close();
    console.log('🔌 Conexion cerrada');
  }
}

createOrUpdateUpcomingCourses();