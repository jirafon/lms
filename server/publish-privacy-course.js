import dotenv from 'dotenv';
import connectDB from './database/db.js';
import { Course } from './models/course.model.js';
import mongoose from 'mongoose';

dotenv.config();

async function publishPrivacyCourse() {
  try {
    await connectDB();
    console.log('✅ Conectado a MongoDB');

    // Buscar y publicar el curso de privacidad
    const course = await Course.findByIdAndUpdate(
      '69f8dc459d0ba24e4f1b322b',
      { isPublished: true },
      { new: true }
    );

    if (course) {
      console.log('🎉 Curso publicado exitosamente:');
      console.log(`   - Título: ${course.courseTitle}`);
      console.log(`   - ID: ${course._id}`);
      console.log(`   - Publicado: ${course.isPublished}`);
      console.log(`   - Precio: ${course.coursePrice}`);
      console.log('\n📱 El curso debería aparecer ahora en el frontend!');
    } else {
      console.log('❌ Curso no encontrado');
    }

  } catch (error) {
    console.error('❌ Error al publicar:', error);
  } finally {
    await mongoose.connection.close();
    console.log('🔌 Conexión cerrada');
  }
}

publishPrivacyCourse();