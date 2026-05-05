import express from 'express';
import { getInstructorMetrics } from '../controllers/instructor.controller.js';
import isAuthenticated from '../middlewares/isAuthenticated.js';

const router = express.Router();

// Route to get instructor metrics
router.get('/metrics', isAuthenticated, getInstructorMetrics);

export default router;