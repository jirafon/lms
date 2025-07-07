import express from "express";
import isAuthenticated from "../middlewares/isAuthenticated.js";
import { createCourse, createLecture, editCourse, editLecture, getCourseById, getCourseLecture, getCreatorCourses, getLectureById, getPublishedCourse, removeCourse, removeLecture, searchCourse, togglePublishCourse } from "../controllers/course.controller.js";
import { upload, handleMulterError } from "../utils/multer.js";
const router = express.Router();

router.route("/create").post(isAuthenticated, createCourse);
router.route("/search").get(searchCourse);
router.route("/published").get(getPublishedCourse);
router.route("/creator").get(isAuthenticated, getCreatorCourses);
router.route("/:courseId").get(getCourseById);
router.route("/:courseId").put(isAuthenticated, upload.single("courseThumbnail"), handleMulterError, editCourse);
router.route("/:courseId").delete(isAuthenticated, removeCourse);
router.route("/:courseId/publish").put(isAuthenticated, togglePublishCourse);
router.route("/:courseId/lecture").post(isAuthenticated, createLecture);
router.route("/:courseId/lecture").get(isAuthenticated, getCourseLecture);
router.route("/:courseId/lecture/:lectureId").post(isAuthenticated, editLecture);
router.route("/lecture/:lectureId").delete(isAuthenticated, removeLecture);
router.route("/lecture/:lectureId").get(isAuthenticated, getLectureById);

export default router;