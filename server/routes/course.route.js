import express from "express";
import isAuthenticated from "../middlewares/isAuthenticated.js";
import { createCourse, createLecture, editCourse, editLecture, enrollStudentByEmail, getCourseById, getCourseLecture, getCourseStudents, getCreatorCourses, getLectureById, getPublishedCourse, getStudentsDashboard, removeCourse, removeLecture, removeStudentFromDashboard, reorderLecture, searchCourse, togglePublishCourse, unenrollStudentFromCourse } from "../controllers/course.controller.js";
import { upload, handleMulterError } from "../utils/multer.js";
const router = express.Router();

router.route("/create").post(isAuthenticated, createCourse);
router.route("/search").get(searchCourse);
router.route("/published").get(getPublishedCourse);
router.route("/creator").get(isAuthenticated, getCreatorCourses);
router.route("/students/dashboard").get(isAuthenticated, getStudentsDashboard);
router.route("/students/enroll").post(isAuthenticated, enrollStudentByEmail);
router.route("/students/unenroll").post(isAuthenticated, unenrollStudentFromCourse);
router.route("/students/remove").post(isAuthenticated, removeStudentFromDashboard);
router.route("/:courseId/students").get(isAuthenticated, getCourseStudents);
router.route("/:courseId").get(getCourseById);
router.route("/:courseId").put(isAuthenticated, upload.single("courseThumbnail"), handleMulterError, editCourse);
router.route("/:courseId").delete(isAuthenticated, removeCourse);
router.route("/:courseId/publish").put(isAuthenticated, togglePublishCourse);
router.route("/:courseId/lecture").post(isAuthenticated, createLecture);
router.route("/:courseId/lecture").get(isAuthenticated, getCourseLecture);
router.route("/:courseId/lecture/:lectureId").post(isAuthenticated, editLecture);
router.route("/:courseId/lecture/:lectureId/reorder").put(isAuthenticated, reorderLecture);
router.route("/lecture/:lectureId").delete(isAuthenticated, removeLecture);
router.route("/lecture/:lectureId").get(isAuthenticated, getLectureById);

export default router;