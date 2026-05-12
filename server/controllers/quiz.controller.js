import { Quiz } from "../models/quiz.model.js";
import { QuizAttempt } from "../models/quizAttempt.model.js";
import { CourseProgress } from "../models/courseProgress.model.js";
import { Lecture } from "../models/lecture.model.js";
import { Course } from "../models/course.model.js";
import { logger } from "../utils/logger.js";
import { getMissingFields, sendError, sendSuccess } from "../utils/apiResponse.js";
import { isValidObjectId, validateQuizPayload } from "../utils/validators.js";

const buildStudentQuizPayload = (quiz) => ({
  ...quiz.toObject(),
  questions: quiz.questions.map((question) => {
    const questionData = question.toObject();

    return {
      ...questionData,
      options: question.options.map((option) => ({
        text: option.text,
      })),
      correctAnswer: undefined,
    };
  }),
});

// ===== INSTRUCTOR FUNCTIONS =====

export const createQuiz = async (req, res) => {
  try {
    const { lectureId, title, description, questions, timeLimit, passingScore, maxAttempts } = req.body;
    const courseId = req.params.courseId;

    if (!isValidObjectId(courseId)) {
      return sendError(res, {
        status: 400,
        message: "Invalid course id",
        errors: ["courseId must be a valid id"],
      });
    }

    const validationErrors = validateQuizPayload({ lectureId, title, description, questions, timeLimit, passingScore, maxAttempts });
    if (validationErrors.length > 0) {
      return sendError(res, {
        status: 400,
        message: "Invalid quiz payload",
        errors: validationErrors,
      });
    }

    const course = await Course.findOne({ _id: courseId, creator: req.id, lectures: lectureId }).select("_id");
    if (!course) {
      return sendError(res, {
        status: 404,
        message: "Course or lecture not found for this instructor"
      });
    }

    // Check if quiz already exists for this lecture
    const existingQuiz = await Quiz.findOne({ lectureId });
    if (existingQuiz) {
      return sendError(res, {
        status: 400,
        message: "Quiz already exists for this lecture"
      });
    }

    const lecture = await Lecture.findById(lectureId).select("_id");
    if (!lecture) {
      return sendError(res, {
        status: 404,
        message: "Lecture not found"
      });
    }

    // Get the highest order number for this course
    const lastQuiz = await Quiz.findOne({ courseId }).sort({ order: -1 });
    const order = lastQuiz ? lastQuiz.order + 1 : 1;

    const quiz = new Quiz({
      lectureId,
      courseId,
      title,
      description,
      questions,
      timeLimit: timeLimit || 0,
      passingScore: passingScore || 70,
      maxAttempts: maxAttempts || 3,
      order
    });

    await quiz.save();

    // Update course progress to include this quiz
    await CourseProgress.updateMany(
      { courseId },
      { $inc: { totalQuizzes: 1 } }
    );

    return sendSuccess(res, {
      status: 201,
      message: "Quiz created successfully",
      quiz
    });
  } catch (error) {
    logger.error("Error creating quiz", { error: error.message, courseId: req.params.courseId });
    return sendError(res, {
      status: 500,
      message: "Error creating quiz"
    });
  }
};

export const updateQuiz = async (req, res) => {
  try {
    const { quizId } = req.params;
    const updateData = req.body;

    if (!isValidObjectId(quizId)) {
      return sendError(res, {
        status: 400,
        message: "Invalid quiz id",
        errors: ["quizId must be a valid id"],
      });
    }

    const validationErrors = validateQuizPayload({
      ...updateData,
      lectureId: updateData.lectureId || "skip",
    }, { requireLectureId: false });
    if (validationErrors.length > 0) {
      return sendError(res, {
        status: 400,
        message: "Invalid quiz payload",
        errors: validationErrors,
      });
    }

    if (updateData.isActive !== undefined && typeof updateData.isActive !== "boolean") {
      return sendError(res, {
        status: 400,
        message: "Invalid quiz payload",
        errors: ["isActive must be a boolean"],
      });
    }

    const quiz = await Quiz.findById(quizId).populate("courseId", "creator");
    if (!quiz) {
      return sendError(res, {
        status: 404,
        message: "Quiz not found"
      });
    }

    if (!quiz.courseId || String(quiz.courseId.creator) !== String(req.id)) {
      return sendError(res, {
        status: 403,
        message: "Unauthorized"
      });
    }

    // Remove fields that shouldn't be updated
    delete updateData.lectureId;
    delete updateData.courseId;

    const updatedQuiz = await Quiz.findByIdAndUpdate(
      quizId,
      updateData,
      { new: true, runValidators: true }
    );

    return sendSuccess(res, {
      message: "Quiz updated successfully",
      quiz: updatedQuiz
    });
  } catch (error) {
    logger.error("Error updating quiz", { error: error.message, quizId: req.params.quizId, userId: req.id });
    return sendError(res, {
      status: 500,
      message: "Error updating quiz"
    });
  }
};

export const deleteQuiz = async (req, res) => {
  try {
    const { quizId } = req.params;

    if (!isValidObjectId(quizId)) {
      return sendError(res, {
        status: 400,
        message: "Invalid quiz id",
        errors: ["quizId must be a valid id"],
      });
    }

    const quiz = await Quiz.findById(quizId).populate("courseId", "creator");
    if (!quiz) {
      return sendError(res, {
        status: 404,
        message: "Quiz not found"
      });
    }

    if (!quiz.courseId || String(quiz.courseId.creator) !== String(req.id)) {
      return sendError(res, {
        status: 403,
        message: "Unauthorized"
      });
    }

    // Delete all attempts for this quiz
    await QuizAttempt.deleteMany({ quizId });

    // Update course progress
    await CourseProgress.updateMany(
      { courseId: quiz.courseId._id },
      { $inc: { totalQuizzes: -1 } }
    );

    await Quiz.findByIdAndDelete(quizId);

    return sendSuccess(res, {
      message: "Quiz deleted successfully"
    });
  } catch (error) {
    logger.error("Error deleting quiz", { error: error.message, quizId: req.params.quizId, userId: req.id });
    return sendError(res, {
      status: 500,
      message: "Error deleting quiz"
    });
  }
};

export const getQuizById = async (req, res) => {
  try {
    const { quizId } = req.params;
    const userId = req.id;

    if (!isValidObjectId(quizId)) {
      return sendError(res, {
        status: 400,
        message: "Invalid quiz id",
        errors: ["quizId must be a valid id"],
      });
    }

    const quiz = await Quiz.findById(quizId);
    if (!quiz) {
      return sendError(res, {
        status: 404,
        message: "Quiz not found"
      });
    }

    // If user is a student, don't include correct answers
    const isInstructor = await Course.findOne({
      _id: quiz.courseId,
      creator: userId
    });

    if (!isInstructor) {
      // Remove correct answers for students
      const studentQuiz = buildStudentQuizPayload(quiz);

      return sendSuccess(res, {
        quiz: studentQuiz
      });
    }

    return sendSuccess(res, {
      quiz
    });
  } catch (error) {
    logger.error("Error fetching quiz", { error: error.message, quizId: req.params.quizId, userId: req.id });
    return sendError(res, {
      status: 500,
      message: "Error fetching quiz"
    });
  }
};

export const getQuizzesByCourse = async (req, res) => {
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

    const quizzes = await Quiz.find({ courseId, isActive: true })
      .populate('lectureId', 'lectureTitle')
      .sort({ order: 1 });

    // Check if user is instructor
    const isInstructor = await Course.findOne({
      _id: courseId,
      creator: userId
    });

    if (isInstructor) {
      // Return full quiz data for instructors
      return sendSuccess(res, {
        quizzes
      });
    } else {
      // Return basic quiz info for students
      const studentQuizzes = quizzes.map(quiz => ({
        _id: quiz._id,
        title: quiz.title,
        description: quiz.description,
        lectureId: quiz.lectureId,
        timeLimit: quiz.timeLimit,
        maxAttempts: quiz.maxAttempts,
        questionCount: quiz.questions.length
      }));

      return sendSuccess(res, {
        quizzes: studentQuizzes
      });
    }
  } catch (error) {
    logger.error("Error fetching quizzes", { error: error.message, courseId: req.params.courseId, userId: req.id });
    return sendError(res, {
      status: 500,
      message: "Error fetching quizzes"
    });
  }
};

// ===== STUDENT FUNCTIONS =====

export const startQuiz = async (req, res) => {
  try {
    const { quizId } = req.params;
    const userId = req.id;

    const missingFields = getMissingFields({ quizId });
    if (missingFields.length > 0) {
      return sendError(res, {
        status: 400,
        message: "quizId is required",
        errors: missingFields,
      });
    }

    const quiz = await Quiz.findById(quizId);
    if (!quiz) {
      return sendError(res, {
        status: 404,
        message: "Quiz not found"
      });
    }

    // Check if user has access to this course
    const courseProgress = await CourseProgress.findOne({
      userId,
      courseId: quiz.courseId
    });

    if (!courseProgress) {
      return sendError(res, {
        status: 403,
        message: "You don't have access to this course"
      });
    }

    const inProgressAttempts = await QuizAttempt.find({
      userId,
      quizId,
      status: 'in_progress'
    }).sort({ createdAt: -1 });

    const activeAttempt = inProgressAttempts[0] || null;

    if (inProgressAttempts.length > 1) {
      await QuizAttempt.deleteMany({
        _id: {
          $in: inProgressAttempts.slice(1).map((attempt) => attempt._id)
        }
      });
    }

    if (activeAttempt) {
      const studentQuiz = buildStudentQuizPayload(quiz);

      return sendSuccess(res, {
        message: "Quiz attempt already in progress",
        quiz: studentQuiz,
        attemptId: activeAttempt._id,
        timeLimit: quiz.timeLimit
      });
    }

    // Check if user has exceeded max attempts
    const attemptCount = await QuizAttempt.countDocuments({
      userId,
      quizId
    });

    if (attemptCount >= quiz.maxAttempts) {
      return sendError(res, {
        status: 400,
        message: `Maximum attempts (${quiz.maxAttempts}) exceeded for this quiz`
      });
    }

    // Create new attempt
    const attempt = new QuizAttempt({
      quizId,
      userId,
      courseId: quiz.courseId,
      lectureId: quiz.lectureId,
      attemptNumber: attemptCount + 1,
      status: 'in_progress'
    });

    await attempt.save();

    // Return quiz without correct answers
    const studentQuiz = buildStudentQuizPayload(quiz);

    return sendSuccess(res, {
      message: "Quiz started successfully",
      quiz: studentQuiz,
      attemptId: attempt._id,
      timeLimit: quiz.timeLimit
    });
  } catch (error) {
    logger.error("Error starting quiz", { error: error.message, quizId: req.params.quizId, userId: req.id });
    return sendError(res, {
      status: 500,
      message: "Error starting quiz"
    });
  }
};

export const submitQuiz = async (req, res) => {
  try {
    const { attemptId } = req.params;
    const { answers, timeSpent } = req.body;
    const userId = req.id;

    const missingFields = getMissingFields({ attemptId, answers });
    if (missingFields.length > 0 || !Array.isArray(answers) || answers.length === 0) {
      return sendError(res, {
        status: 400,
        message: "attemptId and answers are required",
        errors: missingFields.length > 0 ? missingFields : ["answers"],
      });
    }

    const attempt = await QuizAttempt.findOne({
      _id: attemptId,
      userId,
      status: 'in_progress'
    });

    if (!attempt) {
      return sendError(res, {
        status: 404,
        message: "Quiz attempt not found or already completed"
      });
    }

    const quiz = await Quiz.findById(attempt.quizId);
    if (!quiz) {
      return sendError(res, {
        status: 404,
        message: "Quiz not found"
      });
    }

    // Grade the quiz
    let totalScore = 0;
    let totalPoints = 0;
    const gradedAnswers = [];

    for (const answer of answers) {
      const question = quiz.questions.id(answer.questionId);
      if (!question) continue;

      totalPoints += question.points;
      let isCorrect = false;
      let points = 0;

      if (question.type === 'multiple_choice') {
        // Check if all selected options are correct
        const correctOptions = question.options
          .filter(opt => opt.isCorrect)
          .map(opt => opt.text);
        
        isCorrect = answer.selectedOptions.length === correctOptions.length &&
                   answer.selectedOptions.every(opt => correctOptions.includes(opt));
        
        if (isCorrect) {
          points = question.points;
          totalScore += points;
        }
      } else if (question.type === 'true_false') {
        const correctOption = question.options.find(opt => opt.isCorrect);
        isCorrect = answer.selectedOptions.includes(correctOption.text);
        
        if (isCorrect) {
          points = question.points;
          totalScore += points;
        }
      } else if (question.type === 'short_answer') {
        // Simple case-insensitive comparison
        isCorrect = answer.textAnswer.toLowerCase().trim() === 
                   question.correctAnswer.toLowerCase().trim();
        
        if (isCorrect) {
          points = question.points;
          totalScore += points;
        }
      }

      gradedAnswers.push({
        questionId: answer.questionId,
        selectedOptions: answer.selectedOptions,
        textAnswer: answer.textAnswer,
        isCorrect,
        points
      });
    }

    const percentage = totalPoints > 0 ? Math.round((totalScore / totalPoints) * 100) : 0;
    const passed = percentage >= quiz.passingScore;

    // Update attempt
    attempt.answers = gradedAnswers;
    attempt.score = totalScore;
    attempt.totalPoints = totalPoints;
    attempt.percentage = percentage;
    attempt.passed = passed;
    attempt.timeSpent = timeSpent || 0;
    attempt.completedAt = new Date();
    attempt.status = 'completed';

    await attempt.save();

    // Update course progress
    await CourseProgress.findOneAndUpdate(
      { userId, courseId: attempt.courseId },
      {
        $inc: { completedQuizzes: 1 },
        $set: { lastAccessedAt: new Date() }
      }
    );

    // Update lecture progress - only mark as completed if passed
    await CourseProgress.findOneAndUpdate(
      { userId, courseId: attempt.courseId },
      {
        $set: {
          "lectures.$[lecture].quizCompleted": passed, // Only true if quiz was passed
          "lectures.$[lecture].quizScore": percentage,
          "lectures.$[lecture].quizAttempts": attempt.attemptNumber,
          "lectures.$[lecture].bestQuizScore": Math.max(percentage, attempt.bestQuizScore || 0)
        }
      },
      {
        arrayFilters: [{ "lecture.lectureId": attempt.lectureId }]
      }
    );

    return sendSuccess(res, {
      message: "Quiz submitted successfully",
      result: {
        score: totalScore,
        totalPoints,
        percentage,
        passed,
        attemptId: attempt._id
      }
    });
  } catch (error) {
    logger.error("Error submitting quiz", { error: error.message, attemptId: req.params.attemptId, userId: req.id });
    return sendError(res, {
      status: 500,
      message: "Error submitting quiz"
    });
  }
};

export const getQuizResults = async (req, res) => {
  try {
    const { attemptId } = req.params;
    const userId = req.id;

    const attempt = await QuizAttempt.findOne({
      _id: attemptId,
      userId
    }).populate('quizId');

    if (!attempt) {
      return sendError(res, {
        status: 404,
        message: "Quiz attempt not found"
      });
    }

    if (attempt.status !== 'completed') {
      return sendError(res, {
        status: 400,
        message: "Quiz not yet completed"
      });
    }

    // Get quiz with correct answers for review
    const quiz = await Quiz.findById(attempt.quizId);

    const results = {
      attempt: {
        score: attempt.score,
        totalPoints: attempt.totalPoints,
        percentage: attempt.percentage,
        passed: attempt.passed,
        timeSpent: attempt.timeSpent,
        completedAt: attempt.completedAt
      },
      questions: quiz.questions.map(question => {
        const userAnswer = attempt.answers.find(a => 
          a.questionId.toString() === question._id.toString()
        );

        return {
          question: question.question,
          type: question.type,
          userAnswer: userAnswer,
          correctAnswer: question.type === 'short_answer' ? question.correctAnswer : 
                        question.options.filter(opt => opt.isCorrect).map(opt => opt.text),
          explanation: question.explanation,
          points: question.points,
          earnedPoints: userAnswer ? userAnswer.points : 0
        };
      })
    };

    return sendSuccess(res, {
      results
    });
  } catch (error) {
    logger.error("Error fetching quiz results", { error: error.message, attemptId: req.params.attemptId, userId: req.id });
    return sendError(res, {
      status: 500,
      message: "Error fetching quiz results"
    });
  }
};

export const getStudentQuizHistory = async (req, res) => {
  try {
    const userId = req.id;
    const { courseId } = req.params;

    const attempts = await QuizAttempt.find({
      userId,
      courseId
    })
    .populate('quizId', 'title')
    .populate('lectureId', 'lectureTitle')
    .sort({ createdAt: -1 });

    return sendSuccess(res, {
      attempts
    });
  } catch (error) {
    logger.error("Error fetching quiz history", { error: error.message, courseId: req.params.courseId, userId: req.id });
    return sendError(res, {
      status: 500,
      message: "Error fetching quiz history"
    });
  }
};

// Get quiz by lecture ID
export const getQuizByLecture = async (req, res) => {
  try {
    const { lectureId } = req.params;
    const userId = req.id;

    const quiz = await Quiz.findOne({ 
      lectureId, 
      isActive: true 
    }).populate('lectureId', 'lectureTitle');

    if (!quiz) {
      return sendError(res, {
        status: 404,
        message: "Quiz not found for this lecture"
      });
    }

    // Check if user is instructor
    const isInstructor = await Course.findOne({
      _id: quiz.courseId,
      creator: userId
    });

    if (isInstructor) {
      // Return full quiz data for instructors
      return sendSuccess(res, {
        quiz
      });
    } else {
      // Return quiz without correct answers for students
      const studentQuiz = buildStudentQuizPayload(quiz);

      return sendSuccess(res, {
        quiz: studentQuiz
      });
    }
  } catch (error) {
    logger.error("Error fetching quiz for lecture", { error: error.message, lectureId: req.params.lectureId, userId: req.id });
    return sendError(res, {
      status: 500,
      message: "Error fetching quiz for lecture"
    });
  }
}; 