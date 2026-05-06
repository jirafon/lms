import { sendError, sendSuccess } from "../utils/apiResponse.js";
import { logger } from "../utils/logger.js";

export const getInstructorMetrics = async (req, res) => {
  try {
    // Mock data for instructor metrics
    const metrics = {
      totalCourses: 5,
      totalStudents: 120,
      totalRevenue: 4500,
      coursePerformance: [
        { courseTitle: 'Course 1', revenue: 1500 },
        { courseTitle: 'Course 2', revenue: 1200 },
        { courseTitle: 'Course 3', revenue: 800 },
        { courseTitle: 'Course 4', revenue: 600 },
        { courseTitle: 'Course 5', revenue: 400 },
      ],
    };

    return sendSuccess(res, { metrics });
  } catch (error) {
    logger.error('Failed to fetch instructor metrics', { error: error.message, userId: req.id });
    return sendError(res, { status: 500, message: 'Failed to fetch instructor metrics' });
  }
};