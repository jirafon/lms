import { generateCertificate, deleteCertificateFile } from '../utils/certificate.js';
import { CourseProgress } from '../models/courseProgress.model.js';
import { User } from '../models/user.model.js';
import { Course } from '../models/course.model.js';
import { sendError, sendSuccess } from '../utils/apiResponse.js';
import { logger } from '../utils/logger.js';
import { isValidObjectId } from '../utils/validators.js';

export const generateCourseCertificate = async (req, res) => {
  try {
    const { courseId } = req.params;
    const userId = req.id;

    if (!isValidObjectId(courseId)) {
      return sendError(res, {
        status: 400,
        message: "Invalid course id",
        errors: ["courseId must be a valid id"],
      });
    }

    // Check if user has completed the course
    const progress = await CourseProgress.findOne({
      userId,
      courseId
    }).populate('courseId');

    if (!progress) {
      return sendError(res, {
        status: 404,
        message: "Progreso del curso no encontrado"
      });
    }

    if (!progress.certificateEarned) {
      return sendError(res, {
        status: 400,
        message: "No has completado el curso para obtener el certificado"
      });
    }

    // Get user and course details
    const user = await User.findById(userId);
    const course = await Course.findById(courseId).populate('creator', 'name');

    if (!user || !course) {
      return sendError(res, {
        status: 404,
        message: "Usuario o curso no encontrado"
      });
    }

    // Generate certificate
    const certificateData = await generateCertificate(
      user,
      course,
      progress.completedAt
    );

    // Send the file
    res.download(certificateData.filepath, certificateData.filename, (err) => {
      // Delete the temporary file after sending
      deleteCertificateFile(certificateData.filepath);
      
      if (err) {
        logger.error('Error sending certificate', { error: err.message, courseId, userId });
      }
    });

  } catch (error) {
    logger.error('Error generating certificate', { error: error.message, courseId: req.params.courseId, userId: req.id });
    return sendError(res, {
      status: 500,
      message: "Error al generar el certificado"
    });
  }
};

export const checkCertificateEligibility = async (req, res) => {
  try {
    const { courseId } = req.params;
    const userId = req.id;

    if (!isValidObjectId(courseId)) {
      return sendError(res, {
        status: 400,
        message: "Invalid course id",
        errors: ["courseId must be a valid id"],
      });
    }

    const progress = await CourseProgress.findOne({
      userId,
      courseId
    });

    if (!progress) {
      return sendError(res, {
        status: 404,
        message: "Progreso del curso no encontrado"
      });
    }

    const eligibility = {
      courseCompleted: progress.courseProgress === 100,
      quizzesCompleted: progress.completedQuizzes === progress.totalQuizzes,
      averageScore: progress.averageQuizScore,
      certificateEarned: progress.certificateEarned,
      requirements: {
        minQuizScore: 70, // Configurable
        minCourseProgress: 100,
        minQuizzesCompleted: progress.totalQuizzes
      }
    };

    return sendSuccess(res, {
      eligibility
    });

  } catch (error) {
    logger.error('Error checking certificate eligibility', { error: error.message, courseId: req.params.courseId, userId: req.id });
    return sendError(res, {
      status: 500,
      message: "Error al verificar elegibilidad del certificado"
    });
  }
};

export const getUserCertificates = async (req, res) => {
  try {
    const userId = req.id;

    const certificates = await CourseProgress.find({
      userId,
      certificateEarned: true
    }).populate('courseId', 'courseTitle category courseLevel');

    const certificateList = certificates
      .filter(cert => cert.courseId)
      .map(cert => ({
      courseId: cert.courseId._id,
      courseTitle: cert.courseId.courseTitle,
      category: cert.courseId.category,
      level: cert.courseId.courseLevel,
      completedAt: cert.completedAt,
      certificateIssuedAt: cert.certificateIssuedAt,
      finalScore: cert.averageQuizScore
    }));

    return sendSuccess(res, {
      certificates: certificateList
    });

  } catch (error) {
    logger.error('Error fetching user certificates', { error: error.message, userId: req.id });
    return sendError(res, {
      status: 500,
      message: "Error al obtener certificados del usuario"
    });
  }
}; 