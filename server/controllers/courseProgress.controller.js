import { CourseProgress } from "../models/courseProgress.model.js";
import { Course } from "../models/course.model.js";
import { Lecture } from "../models/lecture.model.js";
import { Quiz } from "../models/quiz.model.js";
import { QuizAttempt } from "../models/quizAttempt.model.js";
import { getMissingFields, sendError, sendSuccess } from "../utils/apiResponse.js";
import { logger } from "../utils/logger.js";
import { resolveCourseThumbnailUrl } from "../utils/s3.js";
import { isValidObjectId, validateBooleanField, validateNumberField, validateObjectIdField } from "../utils/validators.js";

const getOrderedLectures = (lectures = []) => {
  return lectures
    .map((lecture, index) => ({
      lecture,
      order: lecture.lectureOrder || index + 1,
    }))
    .sort((first, second) => first.order - second.order)
    .map(({ lecture }) => lecture);
};

const buildInitialCourseProgress = async ({ userId, courseId }) => {
  const course = await Course.findById(courseId).populate('lectures');
  if (!course) {
    return null;
  }

  const orderedLectures = getOrderedLectures(course.lectures);
  const quizzes = await Quiz.find({ courseId, isActive: true });

  const lectureProgress = orderedLectures.map((lecture) => ({
    lectureId: lecture._id,
    watched: false,
    watchTime: 0,
    quizCompleted: false,
    quizScore: 0,
    quizAttempts: 0,
    bestQuizScore: 0,
  }));

  const progress = new CourseProgress({
    userId,
    courseId,
    lectures: lectureProgress,
    totalLectures: orderedLectures.length,
    totalQuizzes: quizzes.length,
    courseProgress: 0,
  });

  await progress.save();

  return progress;
};

export const initializeCourseProgress = async (req, res) => {
  try {
    const { courseId } = req.params;
    const userId = req.id;

    const missingFields = getMissingFields({ courseId });
    if (missingFields.length > 0) {
      return sendError(res, {
        status: 400,
        message: "courseId is required",
        errors: missingFields,
      });
    }

    if (!isValidObjectId(courseId)) {
      return sendError(res, {
        status: 400,
        message: "Invalid course id",
        errors: ["courseId must be a valid id"],
      });
    }

    // Check if progress already exists
    const existingProgress = await CourseProgress.findOne({
      userId,
      courseId
    });

    if (existingProgress) {
      return sendSuccess(res, {
        message: "Course progress already initialized",
        progress: existingProgress
      });
    }

    const progress = await buildInitialCourseProgress({ userId, courseId });
    if (!progress) {
      return sendError(res, {
        status: 404,
        message: "Course not found"
      });
    }

    return sendSuccess(res, {
      status: 201,
      message: "Course progress initialized",
      progress
    });
  } catch (error) {
    logger.error("Error initializing course progress", { error: error.message, courseId: req.params.courseId, userId: req.id });
    return sendError(res, {
      status: 500,
      message: "Error initializing course progress"
    });
  }
};

export const updateQuizProgress = async (req, res) => {
  try {
    const { courseId, lectureId } = req.params;
    const { quizId, score, passed } = req.body;
    const userId = req.id;

    const missingFields = getMissingFields({ courseId, lectureId, score, passed });
    if (missingFields.length > 0) {
      return sendError(res, {
        status: 400,
        message: "courseId, lectureId, score and passed are required",
        errors: missingFields,
      });
    }

    const validationErrors = [];
    validateObjectIdField("courseId", courseId, validationErrors);
    validateObjectIdField("lectureId", lectureId, validationErrors);
    if (quizId !== undefined) {
      validateObjectIdField("quizId", quizId, validationErrors);
    }
    validateNumberField("score", score, validationErrors, { min: 0, max: 100 });
    validateBooleanField("passed", passed, validationErrors);

    if (validationErrors.length > 0) {
      return sendError(res, {
        status: 400,
        message: "Invalid quiz progress payload",
        errors: validationErrors,
      });
    }

    const progress = await CourseProgress.findOne({
      userId,
      courseId
    });

    if (!progress) {
      return sendError(res, {
        status: 404,
        message: "Course progress not found"
      });
    }

    // Find and update the specific lecture's quiz progress
    const lectureIndex = progress.lectures.findIndex(
      lecture => lecture.lectureId.toString() === lectureId
    );

    if (lectureIndex === -1) {
      return sendError(res, {
        status: 404,
        message: "Lecture not found in course progress"
      });
    }

    // Update quiz progress
    progress.lectures[lectureIndex].quizCompleted = passed;
    progress.lectures[lectureIndex].quizScore = score;
    progress.lectures[lectureIndex].quizAttempts += 1;
    
    // Update best score if this is better
    if (score > progress.lectures[lectureIndex].bestQuizScore) {
      progress.lectures[lectureIndex].bestQuizScore = score;
    }

    // Recalculate overall quiz progress
    const completedQuizzes = progress.lectures.filter(lecture => lecture.quizCompleted).length;
    progress.completedQuizzes = completedQuizzes;
    
    // Update average quiz score
    const quizScores = progress.lectures
      .filter(lecture => lecture.quizCompleted && lecture.quizScore > 0)
      .map(lecture => lecture.quizScore);
    
    if (quizScores.length > 0) {
      progress.averageQuizScore = Math.round(
        quizScores.reduce((sum, score) => sum + score, 0) / quizScores.length
      );
    }

    progress.lastAccessedAt = new Date();
    await progress.save();

    return sendSuccess(res, {
      message: "Quiz progress updated",
      progress: {
        lectureProgress: progress.lectures[lectureIndex],
        completedQuizzes: progress.completedQuizzes,
        averageQuizScore: progress.averageQuizScore
      }
    });
  } catch (error) {
    logger.error("Error updating quiz progress", { error: error.message, courseId: req.params.courseId, lectureId: req.params.lectureId, userId: req.id });
    return sendError(res, {
      status: 500,
      message: "Error updating quiz progress"
    });
  }
};

export const checkLectureAccess = async (req, res) => {
  try {
    const { courseId, lectureId } = req.params;
    const userId = req.id;

    const validationErrors = [];
    validateObjectIdField("courseId", courseId, validationErrors);
    validateObjectIdField("lectureId", lectureId, validationErrors);

    if (validationErrors.length > 0) {
      return sendError(res, {
        status: 400,
        message: "Invalid lecture access payload",
        errors: validationErrors,
      });
    }

    let progress = await CourseProgress.findOne({
      userId,
      courseId
    }).populate({
      path: 'lectures.lectureId',
      select: 'lectureTitle'
    });

    if (!progress) {
      const initializedProgress = await buildInitialCourseProgress({ userId, courseId });
      if (!initializedProgress) {
        return sendError(res, {
          status: 404,
          message: "Course not found"
        });
      }

      progress = await CourseProgress.findById(initializedProgress._id).populate({
        path: 'lectures.lectureId',
        select: 'lectureTitle'
      });
    }

    // Get all lectures for this course in order
    const course = await Course.findById(courseId).populate('lectures');
    const sortedLectures = getOrderedLectures(course.lectures);
    
    const targetLectureIndex = sortedLectures.findIndex(
      lecture => lecture._id.toString() === lectureId
    );

    if (targetLectureIndex === -1) {
      return sendError(res, {
        status: 404,
        message: "Lecture not found"
      });
    }

    // First lecture is always accessible
    if (targetLectureIndex === 0) {
      return sendSuccess(res, {
        hasAccess: true,
        message: "Access granted - first lecture"
      });
    }

    // Check if previous lecture's quiz was completed and passed
    const previousLecture = sortedLectures[targetLectureIndex - 1];
    const previousLectureProgress = progress.lectures.find(
      lecture => lecture.lectureId.toString() === previousLecture._id.toString()
    );

    if (!previousLectureProgress || !previousLectureProgress.quizCompleted) {
      return sendSuccess(res, {
        hasAccess: false,
        message: "Debes completar y aprobar el quiz de la lectura anterior",
        requiredLecture: previousLecture.lectureTitle
      });
    }

    return sendSuccess(res, {
      hasAccess: true,
      message: "Access granted"
    });
  } catch (error) {
    logger.error("Error checking lecture access", { error: error.message, courseId: req.params.courseId, lectureId: req.params.lectureId, userId: req.id });
    return sendError(res, {
      status: 500,
      message: "Error checking lecture access"
    });
  }
};

// Update lecture progress (watch time, completion)
export const updateLectureProgress = async (req, res) => {
  try {
    const { courseId, lectureId } = req.params;
    const { watchTime, completed } = req.body;
    const userId = req.id;

    const validationErrors = [];
    validateObjectIdField("courseId", courseId, validationErrors);
    validateObjectIdField("lectureId", lectureId, validationErrors);
    if (watchTime !== undefined) {
      validateNumberField("watchTime", watchTime, validationErrors, { min: 0 });
    }
    if (completed !== undefined) {
      validateBooleanField("completed", completed, validationErrors);
    }

    if (validationErrors.length > 0) {
      return sendError(res, {
        status: 400,
        message: "Invalid lecture progress payload",
        errors: validationErrors,
      });
    }

    // First check if user has access to this lecture
    const accessCheck = await checkLectureAccessInternal(userId, courseId, lectureId);
    if (!accessCheck.hasAccess) {
      return sendError(res, {
        status: 403,
        message: accessCheck.message,
        requiredLecture: accessCheck.requiredLecture
      });
    }

    const progress = await CourseProgress.findOne({
      userId,
      courseId
    });

    if (!progress) {
      return sendError(res, {
        status: 404,
        message: "Course progress not found"
      });
    }

    // Find and update the specific lecture
    const lectureIndex = progress.lectures.findIndex(
      lecture => lecture.lectureId.toString() === lectureId
    );

    if (lectureIndex === -1) {
      return sendError(res, {
        status: 404,
        message: "Lecture not found in course progress"
      });
    }

    // Update lecture progress
    if (watchTime !== undefined) {
      progress.lectures[lectureIndex].watchTime = watchTime;
    }

    if (completed) {
      progress.lectures[lectureIndex].watched = true;
      progress.lectures[lectureIndex].completedAt = new Date();
    }

    // Recalculate overall progress
    const completedLectures = progress.lectures.filter(lecture => lecture.watched).length;
    progress.completedLectures = completedLectures;
    progress.courseProgress = Math.round((completedLectures / progress.totalLectures) * 100);

    // Check if course is completed
    if (progress.courseProgress === 100 && !progress.completedAt) {
      progress.completedAt = new Date();
      progress.certificateEarned = true;
      progress.certificateIssuedAt = new Date();
    }

    progress.lastAccessedAt = new Date();
    await progress.save();

    return sendSuccess(res, {
      message: "Lecture progress updated",
      progress: {
        lectureProgress: progress.lectures[lectureIndex],
        courseProgress: progress.courseProgress,
        completedLectures: progress.completedLectures,
        totalLectures: progress.totalLectures
      }
    });
  } catch (error) {
    logger.error("Error updating lecture progress", { error: error.message, courseId: req.params.courseId, lectureId: req.params.lectureId, userId: req.id });
    return sendError(res, {
      status: 500,
      message: "Error updating lecture progress"
    });
  }
};

// Internal function to check lecture access without HTTP response
const checkLectureAccessInternal = async (userId, courseId, lectureId) => {
  try {
    const progress = await CourseProgress.findOne({
      userId,
      courseId
    });

    if (!progress) {
      return { hasAccess: false, message: "Course progress not found" };
    }

    // Get all lectures for this course in order
    const course = await Course.findById(courseId).populate('lectures');
    const sortedLectures = getOrderedLectures(course.lectures);
    
    const targetLectureIndex = sortedLectures.findIndex(
      lecture => lecture._id.toString() === lectureId
    );

    if (targetLectureIndex === -1) {
      return { hasAccess: false, message: "Lecture not found" };
    }

    // First lecture is always accessible
    if (targetLectureIndex === 0) {
      return { hasAccess: true, message: "Access granted - first lecture" };
    }

    // Check if previous lecture's quiz was completed and passed
    const previousLecture = sortedLectures[targetLectureIndex - 1];
    const previousLectureProgress = progress.lectures.find(
      lecture => lecture.lectureId.toString() === previousLecture._id.toString()
    );

    if (!previousLectureProgress || !previousLectureProgress.quizCompleted) {
      return {
        hasAccess: false,
        message: "Debes completar y aprobar el quiz de la lectura anterior",
        requiredLecture: previousLecture.lectureTitle
      };
    }

    return { hasAccess: true, message: "Access granted" };
  } catch (error) {
    logger.error("Error checking lecture access internally", { error: error.message, courseId, lectureId, userId });
    return { hasAccess: false, message: "Error checking access" };
  }
};

export const getCourseProgress = async (req, res) => {
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
    }).populate({
      path: 'lectures.lectureId',
      select: 'lectureTitle'
    });

    if (!progress) {
      return sendError(res, {
        status: 404,
        message: "Course progress not found"
      });
    }

    // Get quiz information
    const quizzes = await Quiz.find({ courseId, isActive: true });
    const quizAttempts = await QuizAttempt.find({
      userId,
      courseId
    });

    // Calculate quiz statistics
    const quizStats = {
      totalQuizzes: quizzes.length,
      completedQuizzes: quizAttempts.filter(attempt => attempt.status === 'completed').length,
      averageScore: quizAttempts.length > 0 
        ? Math.round(quizAttempts.reduce((sum, attempt) => sum + attempt.percentage, 0) / quizAttempts.length)
        : 0,
      totalAttempts: quizAttempts.length
    };

    return sendSuccess(res, {
      progress: {
        ...progress.toObject(),
        quizStats
      }
    });
  } catch (error) {
    logger.error("Error fetching course progress", { error: error.message, courseId: req.params.courseId, userId: req.id });
    return sendError(res, {
      status: 500,
      message: "Error fetching course progress"
    });
  }
};

export const getUserProgress = async (req, res) => {
  try {
    const userId = req.id;

    const allProgress = await CourseProgress.find({ userId })
      .populate('courseId', 'courseTitle courseThumbnail courseThumbnailS3Key category')
      .populate('lectures.lectureId', 'lectureTitle')
      .sort({ lastAccessedAt: -1 });

    const progressSummary = allProgress.map(progress => ({
      courseId: progress.courseId,
      courseTitle: progress.courseId.courseTitle,
      courseThumbnail: resolveCourseThumbnailUrl(progress.courseId),
      category: progress.courseId.category,
      progress: progress.courseProgress,
      completedLectures: progress.completedLectures,
      totalLectures: progress.totalLectures,
      completedQuizzes: progress.completedQuizzes,
      totalQuizzes: progress.totalQuizzes,
      averageQuizScore: progress.averageQuizScore,
      certificateEarned: progress.certificateEarned,
      lastAccessedAt: progress.lastAccessedAt,
      startedAt: progress.startedAt,
      completedAt: progress.completedAt
    }));

    return sendSuccess(res, {
      progress: progressSummary
    });
  } catch (error) {
    logger.error("Error fetching user progress", { error: error.message, userId: req.id });
    return sendError(res, {
      status: 500,
      message: "Error fetching user progress"
    });
  }
};

export const getCourseAnalytics = async (req, res) => {
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

    // Check if user is the course creator
    const course = await Course.findOne({
      _id: courseId,
      creator: userId
    });

    if (!course) {
      return sendError(res, {
        status: 403,
        message: "You don't have permission to view this course's analytics"
      });
    }

    // Get all progress for this course
    const allProgress = await CourseProgress.find({ courseId })
      .populate('userId', 'name email')
      .populate('lectures.lectureId', 'lectureTitle');

    // Get quiz attempts
    const quizAttempts = await QuizAttempt.find({ courseId })
      .populate('userId', 'name email')
      .populate('quizId', 'title');

    // Calculate analytics
    const analytics = {
      totalEnrollments: allProgress.length,
      activeStudents: allProgress.filter(p => 
        new Date(p.lastAccessedAt) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
      ).length,
      averageProgress: allProgress.length > 0 
        ? Math.round(allProgress.reduce((sum, p) => sum + p.courseProgress, 0) / allProgress.length)
        : 0,
      completionRate: allProgress.length > 0
        ? Math.round((allProgress.filter(p => p.courseProgress === 100).length / allProgress.length) * 100)
        : 0,
      averageQuizScore: quizAttempts.length > 0
        ? Math.round(quizAttempts.reduce((sum, attempt) => sum + attempt.percentage, 0) / quizAttempts.length)
        : 0,
      totalQuizAttempts: quizAttempts.length,
      certificatesIssued: allProgress.filter(p => p.certificateEarned).length
    };

    // Get progress by lecture
    const lectureAnalytics = course.lectures.map(lecture => {
      const lectureProgress = allProgress.map(p => 
        p.lectures.find(l => l.lectureId.toString() === lecture._id.toString())
      ).filter(Boolean);

      return {
        lectureId: lecture._id,
        lectureTitle: lecture.lectureTitle,
        watchedCount: lectureProgress.filter(lp => lp.watched).length,
        averageWatchTime: lectureProgress.length > 0
          ? Math.round(lectureProgress.reduce((sum, lp) => sum + lp.watchTime, 0) / lectureProgress.length)
          : 0,
        quizCompletionRate: lectureProgress.length > 0
          ? Math.round((lectureProgress.filter(lp => lp.quizCompleted).length / lectureProgress.length) * 100)
          : 0
      };
    });

    return sendSuccess(res, {
      analytics: {
        ...analytics,
        lectureAnalytics
      }
    });
  } catch (error) {
    logger.error("Error fetching course analytics", { error: error.message, courseId: req.params.courseId, userId: req.id });
    return sendError(res, {
      status: 500,
      message: "Error fetching course analytics"
    });
  }
};
