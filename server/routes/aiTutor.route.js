import express from "express";
import isAuthenticated from "../middlewares/isAuthenticated.js";
import { chatWithTutor, clearTutorHistory, getTutorHistory } from "../controllers/aiTutor.controller.js";

const router = express.Router();

router.route("/course/:courseId/chat").post(isAuthenticated, chatWithTutor);
router
	.route("/course/:courseId/lecture/:lectureId/history")
	.get(isAuthenticated, getTutorHistory)
	.delete(isAuthenticated, clearTutorHistory);

export default router;