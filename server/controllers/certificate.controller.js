import { generateCertificate, deleteCertificateFile } from '../utils/certificate.js';
import { CourseProgress } from '../models/courseProgress.model.js';
import { User } from '../models/user.model.js';
import { Course } from '../models/course.model.js';
import fs from 'fs';

export const generateCourseCertificate = async (req, res) => {
  try {
    const { courseId } = req.params;
    const userId = req.id;

    // Check if user has completed the course
    const progress = await CourseProgress.findOne({
      userId,
      courseId
    }).populate('courseId');

    if (!progress) {
      return res.status(404).json({
        success: false,
        message: "Progreso del curso no encontrado"
      });
    }

    if (!progress.certificateEarned) {
      return res.status(400).json({
        success: false,
        message: "No has completado el curso para obtener el certificado"
      });
    }

    // Get user and course details
    const user = await User.findById(userId);
    const course = await Course.findById(courseId).populate('creator', 'name');

    if (!user || !course) {
      return res.status(404).json({
        success: false,
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
        console.error('Error sending certificate:', err);
      }
    });

  } catch (error) {
    console.error('Error generating certificate:', error);
    return res.status(500).json({
      success: false,
      message: "Error al generar el certificado"
    });
  }
};

export const checkCertificateEligibility = async (req, res) => {
  try {
    const { courseId } = req.params;
    const userId = req.id;

    const progress = await CourseProgress.findOne({
      userId,
      courseId
    });

    if (!progress) {
      return res.status(404).json({
        success: false,
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

    return res.status(200).json({
      success: true,
      eligibility
    });

  } catch (error) {
    console.error('Error checking certificate eligibility:', error);
    return res.status(500).json({
      success: false,
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

    const certificateList = certificates.map(cert => ({
      courseId: cert.courseId._id,
      courseTitle: cert.courseId.courseTitle,
      category: cert.courseId.category,
      level: cert.courseId.courseLevel,
      completedAt: cert.completedAt,
      certificateIssuedAt: cert.certificateIssuedAt,
      finalScore: cert.averageQuizScore
    }));

    return res.status(200).json({
      success: true,
      certificates: certificateList
    });

  } catch (error) {
    console.error('Error fetching user certificates:', error);
    return res.status(500).json({
      success: false,
      message: "Error al obtener certificados del usuario"
    });
  }
}; 