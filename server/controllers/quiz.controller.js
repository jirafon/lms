import { Quiz } from "../models/quiz.model.js";
import { QuizAttempt } from "../models/quizAttempt.model.js";
import { CourseProgress } from "../models/courseProgress.model.js";
import { Lecture } from "../models/lecture.model.js";
import { Course } from "../models/course.model.js";

// ===== INSTRUCTOR FUNCTIONS =====

export const createQuiz = async (req, res) => {
  console.log("createQuiz llamado");
  try {
    const { lectureId, title, description, questions, timeLimit, passingScore, maxAttempts } = req.body;
    const courseId = req.params.courseId;

    // Validate required fields
    if (!lectureId || !title || !questions || questions.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Lecture ID, title, and questions are required"
      });
    }

    // Check if quiz already exists for this lecture
    const existingQuiz = await Quiz.findOne({ lectureId });
    if (existingQuiz) {
      return res.status(400).json({
        success: false,
        message: "Quiz already exists for this lecture"
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

    console.log("Quiz creado, enviando respuesta");
    return res.status(201).json({
      success: true,
      message: "Quiz created successfully",
      quiz
    });
  } catch (error) {
    console.log("Error en createQuiz:", error);
    return res.status(500).json({
      success: false,
      message: "Error creating quiz"
    });
  }
};

export const updateQuiz = async (req, res) => {
  try {
    const { quizId } = req.params;
    const updateData = req.body;

    const quiz = await Quiz.findById(quizId);
    if (!quiz) {
      return res.status(404).json({
        success: false,
        message: "Quiz not found"
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

    return res.status(200).json({
      success: true,
      message: "Quiz updated successfully",
      quiz: updatedQuiz
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message: "Error updating quiz"
    });
  }
};

export const deleteQuiz = async (req, res) => {
  try {
    const { quizId } = req.params;

    const quiz = await Quiz.findById(quizId);
    if (!quiz) {
      return res.status(404).json({
        success: false,
        message: "Quiz not found"
      });
    }

    // Delete all attempts for this quiz
    await QuizAttempt.deleteMany({ quizId });

    // Update course progress
    await CourseProgress.updateMany(
      { courseId: quiz.courseId },
      { $inc: { totalQuizzes: -1 } }
    );

    await Quiz.findByIdAndDelete(quizId);

    return res.status(200).json({
      success: true,
      message: "Quiz deleted successfully"
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message: "Error deleting quiz"
    });
  }
};

export const getQuizById = async (req, res) => {
  try {
    const { quizId } = req.params;
    const userId = req.id;

    const quiz = await Quiz.findById(quizId);
    if (!quiz) {
      return res.status(404).json({
        success: false,
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
      const studentQuiz = {
        ...quiz.toObject(),
        questions: quiz.questions.map(q => ({
          ...q,
          options: q.options.map(opt => ({
            text: opt.text,
            // Don't include isCorrect for students
          })),
          correctAnswer: undefined // Remove correct answer
        }))
      };

      return res.status(200).json({
        success: true,
        quiz: studentQuiz
      });
    }

    return res.status(200).json({
      success: true,
      quiz
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message: "Error fetching quiz"
    });
  }
};

export const getQuizzesByCourse = async (req, res) => {
  try {
    const { courseId } = req.params;
    const userId = req.id;

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
      return res.status(200).json({
        success: true,
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

      return res.status(200).json({
        success: true,
        quizzes: studentQuizzes
      });
    }
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message: "Error fetching quizzes"
    });
  }
};

// ===== STUDENT FUNCTIONS =====

export const startQuiz = async (req, res) => {
  try {
    const { quizId } = req.params;
    const userId = req.id;

    const quiz = await Quiz.findById(quizId);
    if (!quiz) {
      return res.status(404).json({
        success: false,
        message: "Quiz not found"
      });
    }

    // Check if user has access to this course
    const courseProgress = await CourseProgress.findOne({
      userId,
      courseId: quiz.courseId
    });

    if (!courseProgress) {
      return res.status(403).json({
        success: false,
        message: "You don't have access to this course"
      });
    }

    // Check if user has exceeded max attempts
    const attemptCount = await QuizAttempt.countDocuments({
      userId,
      quizId
    });

    if (attemptCount >= quiz.maxAttempts) {
      return res.status(400).json({
        success: false,
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
    const studentQuiz = {
      ...quiz.toObject(),
      questions: quiz.questions.map(q => ({
        ...q,
        options: q.options.map(opt => ({
          text: opt.text,
          // Don't include isCorrect
        })),
        correctAnswer: undefined
      }))
    };

    return res.status(200).json({
      success: true,
      message: "Quiz started successfully",
      quiz: studentQuiz,
      attemptId: attempt._id,
      timeLimit: quiz.timeLimit
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message: "Error starting quiz"
    });
  }
};

export const submitQuiz = async (req, res) => {
  try {
    const { attemptId } = req.params;
    const { answers, timeSpent } = req.body;
    const userId = req.id;

    const attempt = await QuizAttempt.findOne({
      _id: attemptId,
      userId,
      status: 'in_progress'
    });

    if (!attempt) {
      return res.status(404).json({
        success: false,
        message: "Quiz attempt not found or already completed"
      });
    }

    const quiz = await Quiz.findById(attempt.quizId);
    if (!quiz) {
      return res.status(404).json({
        success: false,
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

    // Update lecture progress
    await CourseProgress.findOneAndUpdate(
      { userId, courseId: attempt.courseId },
      {
        $set: {
          "lectures.$[lecture].quizCompleted": true,
          "lectures.$[lecture].quizScore": percentage,
          "lectures.$[lecture].quizAttempts": attempt.attemptNumber,
          "lectures.$[lecture].bestQuizScore": Math.max(percentage, attempt.bestQuizScore || 0)
        }
      },
      {
        arrayFilters: [{ "lecture.lectureId": attempt.lectureId }]
      }
    );

    return res.status(200).json({
      success: true,
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
    console.log(error);
    return res.status(500).json({
      success: false,
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
      return res.status(404).json({
        success: false,
        message: "Quiz attempt not found"
      });
    }

    if (attempt.status !== 'completed') {
      return res.status(400).json({
        success: false,
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

    return res.status(200).json({
      success: true,
      results
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
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

    return res.status(200).json({
      success: true,
      attempts
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message: "Error fetching quiz history"
    });
  }
}; 