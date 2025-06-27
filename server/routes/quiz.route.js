import express from "express";
import isAuthenticated from "../middlewares/isAuthenticated.js";
import {
  // Instructor functions
  createQuiz,
  updateQuiz,
  deleteQuiz,
  getQuizById,
  getQuizzesByCourse,
  
  // Student functions
  startQuiz,
  submitQuiz,
  getQuizResults,
  getStudentQuizHistory
} from "../controllers/quiz.controller.js";

const router = express.Router();

// ===== INSTRUCTOR ROUTES =====

// Create quiz for a course
router.route("/course/:courseId").post(isAuthenticated, createQuiz);

// Get all quizzes for a course
router.route("/course/:courseId").get(isAuthenticated, getQuizzesByCourse);

// Get specific quiz (with answers for instructors, without for students)
router.route("/:quizId").get(isAuthenticated, getQuizById);

// Update quiz
router.route("/:quizId").put(isAuthenticated, updateQuiz);

// Delete quiz
router.route("/:quizId").delete(isAuthenticated, deleteQuiz);

// ===== STUDENT ROUTES =====

// Start a quiz attempt
router.route("/:quizId/start").post(isAuthenticated, startQuiz);

// Submit quiz answers
router.route("/attempt/:attemptId/submit").post(isAuthenticated, submitQuiz);

// Get quiz results
router.route("/attempt/:attemptId/results").get(isAuthenticated, getQuizResults);

// Get student's quiz history for a course
router.route("/course/:courseId/history").get(isAuthenticated, getStudentQuizHistory);

export default router; 