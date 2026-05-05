import { CourseProgress } from "../models/courseProgress.model.js";
import { Course } from "../models/course.model.js";
import { Lecture } from "../models/lecture.model.js";
import { Quiz } from "../models/quiz.model.js";
import { QuizAttempt } from "../models/quizAttempt.model.js";

export const initializeCourseProgress = async (req, res) => {
  try {
    const { courseId } = req.params;
    const userId = req.id;

    // Check if progress already exists
    const existingProgress = await CourseProgress.findOne({
      userId,
      courseId
    });

    if (existingProgress) {
      return res.status(200).json({
        success: true,
        message: "Course progress already initialized",
        progress: existingProgress
      });
    }

    // Get course and lectures
    const course = await Course.findById(courseId).populate('lectures');
    if (!course) {
      return res.status(404).json({
        success: false,
        message: "Course not found"
      });
    }

    // Get quizzes for this course
    const quizzes = await Quiz.find({ courseId, isActive: true });

    // Initialize lecture progress
    const lectureProgress = course.lectures.map(lecture => ({
      lectureId: lecture._id,
      watched: false,
      watchTime: 0,
      quizCompleted: false,
      quizScore: 0,
      quizAttempts: 0,
      bestQuizScore: 0
    }));

    const progress = new CourseProgress({
      userId,
      courseId,
      lectures: lectureProgress,
      totalLectures: course.lectures.length,
      totalQuizzes: quizzes.length,
      courseProgress: 0
    });

    await progress.save();

    return res.status(201).json({
      success: true,
      message: "Course progress initialized",
      progress
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message: "Error initializing course progress"
    });
  }
};

export const updateQuizProgress = async (req, res) => {
  try {
    const { courseId, lectureId } = req.params;
    const { quizId, score, passed } = req.body;
    const userId = req.id;

    const progress = await CourseProgress.findOne({
      userId,
      courseId
    });

    if (!progress) {
      return res.status(404).json({
        success: false,
        message: "Course progress not found"
      });
    }

    // Find and update the specific lecture's quiz progress
    const lectureIndex = progress.lectures.findIndex(
      lecture => lecture.lectureId.toString() === lectureId
    );

    if (lectureIndex === -1) {
      return res.status(404).json({
        success: false,
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

    return res.status(200).json({
      success: true,
      message: "Quiz progress updated",
      progress: {
        lectureProgress: progress.lectures[lectureIndex],
        completedQuizzes: progress.completedQuizzes,
        averageQuizScore: progress.averageQuizScore
      }
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message: "Error updating quiz progress"
    });
  }
};

export const checkLectureAccess = async (req, res) => {
  try {
    const { courseId, lectureId } = req.params;
    const userId = req.id;

    const progress = await CourseProgress.findOne({
      userId,
      courseId
    }).populate({
      path: 'lectures.lectureId',
      select: 'lectureTitle'
    });

    if (!progress) {
      return res.status(404).json({
        success: false,
        message: "Course progress not found"
      });
    }

    // Get all lectures for this course in order
    const course = await Course.findById(courseId).populate('lectures');
    const sortedLectures = course.lectures.sort((a, b) => a.createdAt - b.createdAt);
    
    const targetLectureIndex = sortedLectures.findIndex(
      lecture => lecture._id.toString() === lectureId
    );

    if (targetLectureIndex === -1) {
      return res.status(404).json({
        success: false,
        message: "Lecture not found"
      });
    }

    // First lecture is always accessible
    if (targetLectureIndex === 0) {
      return res.status(200).json({
        success: true,
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
      return res.status(200).json({
        success: true,
        hasAccess: false,
        message: "Debes completar y aprobar el quiz de la lectura anterior",
        requiredLecture: previousLecture.lectureTitle
      });
    }

    return res.status(200).json({
      success: true,
      hasAccess: true,
      message: "Access granted"
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
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

    // First check if user has access to this lecture
    const accessCheck = await checkLectureAccessInternal(userId, courseId, lectureId);
    if (!accessCheck.hasAccess) {
      return res.status(403).json({
        success: false,
        message: accessCheck.message,
        requiredLecture: accessCheck.requiredLecture
      });
    }

    const progress = await CourseProgress.findOne({
      userId,
      courseId
    });

    if (!progress) {
      return res.status(404).json({
        success: false,
        message: "Course progress not found"
      });
    }

    // Find and update the specific lecture
    const lectureIndex = progress.lectures.findIndex(
      lecture => lecture.lectureId.toString() === lectureId
    );

    if (lectureIndex === -1) {
      return res.status(404).json({
        success: false,
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

    return res.status(200).json({
      success: true,
      message: "Lecture progress updated",
      progress: {
        lectureProgress: progress.lectures[lectureIndex],
        courseProgress: progress.courseProgress,
        completedLectures: progress.completedLectures,
        totalLectures: progress.totalLectures
      }
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
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
    const sortedLectures = course.lectures.sort((a, b) => a.createdAt - b.createdAt);
    
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
    console.log(error);
    return { hasAccess: false, message: "Error checking access" };
  }
};

export const getCourseProgress = async (req, res) => {
  try {
    const { courseId } = req.params;
    const userId = req.id;

    const progress = await CourseProgress.findOne({
      userId,
      courseId
    }).populate({
      path: 'lectures.lectureId',
      select: 'lectureTitle'
    });

    if (!progress) {
      return res.status(404).json({
        success: false,
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

    return res.status(200).json({
      success: true,
      progress: {
        ...progress.toObject(),
        quizStats
      }
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message: "Error fetching course progress"
    });
  }
};

export const getUserProgress = async (req, res) => {
  try {
    const userId = req.id;

    const allProgress = await CourseProgress.find({ userId })
      .populate('courseId', 'courseTitle courseThumbnail category')
      .populate('lectures.lectureId', 'lectureTitle')
      .sort({ lastAccessedAt: -1 });

    const progressSummary = allProgress.map(progress => ({
      courseId: progress.courseId,
      courseTitle: progress.courseId.courseTitle,
      courseThumbnail: progress.courseId.courseThumbnail,
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

    return res.status(200).json({
      success: true,
      progress: progressSummary
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message: "Error fetching user progress"
    });
  }
};

export const getCourseAnalytics = async (req, res) => {
  try {
    const { courseId } = req.params;
    const userId = req.id;

    // Check if user is the course creator
    const course = await Course.findOne({
      _id: courseId,
      creator: userId
    });

    if (!course) {
      return res.status(403).json({
        success: false,
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

    return res.status(200).json({
      success: true,
      analytics: {
        ...analytics,
        lectureAnalytics
      }
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message: "Error fetching course analytics"
    });
  }
};
