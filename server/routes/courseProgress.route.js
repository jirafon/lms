import express from "express"
import isAuthenticated from "../middlewares/isAuthenticated.js";
import {
  initializeCourseProgress,
  updateLectureProgress,
  getCourseProgress,
  getUserProgress,
  getCourseAnalytics
} from "../controllers/courseProgress.controller.js";

const router = express.Router()

// Initialize course progress when user enrolls
router.route("/course/:courseId/initialize").post(isAuthenticated, initializeCourseProgress);

// Update lecture progress (watch time, completion)
router.route("/course/:courseId/lecture/:lectureId").put(isAuthenticated, updateLectureProgress);

// Get progress for a specific course
router.route("/course/:courseId").get(isAuthenticated, getCourseProgress);

// Get all user progress across courses
router.route("/user").get(isAuthenticated, getUserProgress);

// Get course analytics (instructor only)
router.route("/course/:courseId/analytics").get(isAuthenticated, getCourseAnalytics);

export default router;