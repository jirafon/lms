import dotenv from 'dotenv';
import mongoose from 'mongoose';
import connectDB from './database/db.js';
import { Course } from './models/course.model.js';

dotenv.config();

const COURSE_ASSETS = {
  'Ciberseguridad y Proteccion de la Informacion': {
    localThumbnail: '/course-thumbnails/ciberseguridad.png',
  },
  'Ley Karin - Prevencion del Acoso y Violencia en el Trabajo': {
    localThumbnail: '/course-thumbnails/ley-karin.png',
  },
  'IA Responsable y Uso Seguro de Inteligencia Artificial': {
    localThumbnail: '/course-thumbnails/ia-responsable.png',
  },
  'Libre Competencia y Prevencion de Conductas Anticompetitivas': {
    localThumbnail: '/course-thumbnails/libre-competencia.png',
  },
  'Prevencion de Fraude Interno': {
    localThumbnail: '/course-thumbnails/fraude-interno.png',
  },
  'Compliance para Proveedores y Terceros': {
    localThumbnail: '/course-thumbnails/proveedores-terceros.png',
  },
  'Seguridad de la Informacion - Awareness ISO 27001': {
    localThumbnail: '/course-thumbnails/iso-27001.png',
  },
  'HSCE y Seguridad Operacional': {
    localThumbnail: '/course-thumbnails/hsce.png',
  },
  'Compliance para Contratistas Mineros': {
    localThumbnail: '/course-thumbnails/contratistas-mineros.png',
  },
  'Transferencias de Valor y Compliance Farmaceutico': {
    localThumbnail: '/course-thumbnails/compliance-farmaceutico.png',
  },
  'Proteccion de Datos Sensibles y Compliance Clinico': {
    localThumbnail: '/course-thumbnails/compliance-clinico.png',
  },
  'Integridad y Compliance en Mercado Publico': {
    localThumbnail: '/course-thumbnails/mercado-publico.png',
  },
  'Gobierno Corporativo y Gestion de Riesgos para Directorios': {
    localThumbnail: '/course-thumbnails/gobierno-corporativo.png',
  },
  'Gestion de Crisis y Continuidad Operacional': {
    localThumbnail: '/course-thumbnails/gestion-crisis.png',
  },
  'Codigo de Conducta Corporativo': {
    localThumbnail: '/course-thumbnails/codigo-conducta.png',
  },
  'Canal de Denuncias y Speak Up Culture': {
    localThumbnail: '/course-thumbnails/speak-up.png',
  },
  'Onboarding Etico para Nuevos Colaboradores': {
    localThumbnail: '/course-thumbnails/onboarding-etico.png',
  },
};

const buildPngThumbnail = ({ localThumbnail }) => {
  return localThumbnail;
};

async function updateUpcomingCourseCommercials() {
  try {
    await connectDB();
    console.log('✅ Conectado a MongoDB');

    let updated = 0;

    for (const [courseTitle, visualConfig] of Object.entries(COURSE_ASSETS)) {
      const course = await Course.findOne({ courseTitle });
      if (!course) {
        console.log(`⚠️ Curso no encontrado: ${courseTitle}`);
        continue;
      }

      course.quoteOnly = true;
      course.coursePrice = 0;
      course.currency = 'CLP';
      course.flowPricing = {
        enabled: false,
        currency: 'CLP',
      };
      course.courseThumbnail = buildPngThumbnail(visualConfig);
      course.subTitle = 'Contactenos para cotizar - Minimo 10 alumnos por grupo';

      await course.save();
      updated += 1;
      console.log(`♻️ Curso comercial actualizado: ${course.courseTitle}`);
    }

    console.log('\n🎉 Actualizacion comercial completada');
    console.log(`   - Cursos actualizados: ${updated}`);
  } catch (error) {
    console.error('❌ Error al actualizar configuracion comercial:', error);
    console.error(error.stack);
    process.exitCode = 1;
  } finally {
    await mongoose.connection.close();
    console.log('🔌 Conexion cerrada');
  }
}

updateUpcomingCourseCommercials();
