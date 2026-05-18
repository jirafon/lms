import { AITutorConversation } from "../models/aiTutorConversation.model.js";
import { Course } from "../models/course.model.js";
import { CourseProgress } from "../models/courseProgress.model.js";
import { CoursePurchase } from "../models/coursePurchase.model.js";
import { sendError, sendSuccess } from "../utils/apiResponse.js";
import { logger } from "../utils/logger.js";

export const getInstructorMetrics = async (req, res) => {
  try {
    const instructorId = req.id;

    const courses = await Course.find({ creator: instructorId }).select("_id courseTitle enrolledStudents");
    const courseIds = courses.map((course) => course._id);

    if (courseIds.length === 0) {
      return sendSuccess(res, {
        metrics: {
          totalCourses: 0,
          totalStudents: 0,
          totalRevenue: 0,
          coursePerformance: [],
          tutorMetrics: {
            totalConversations: 0,
            totalLearnersUsingTutor: 0,
            totalPromptMessages: 0,
            averageMessagesPerConversation: 0,
            topTutorCourses: [],
          },
        },
      });
    }

    const [purchases, courseProgressRecords, conversations] = await Promise.all([
      CoursePurchase.find({
        courseId: { $in: courseIds },
        status: "completed",
      }).select("courseId amount"),
      CourseProgress.find({ courseId: { $in: courseIds } }).select("courseId userId"),
      AITutorConversation.find({ courseId: { $in: courseIds } }).select("courseId userId messages lastActivityAt"),
    ]);

    const studentsByCourse = new Map();
    const uniqueStudents = new Set();

    courseProgressRecords.forEach((record) => {
      const courseKey = String(record.courseId);
      const userKey = String(record.userId);

      uniqueStudents.add(userKey);
      if (!studentsByCourse.has(courseKey)) {
        studentsByCourse.set(courseKey, new Set());
      }
      studentsByCourse.get(courseKey).add(userKey);
    });

    const revenueByCourse = new Map();
    let totalRevenue = 0;

    purchases.forEach((purchase) => {
      const courseKey = String(purchase.courseId);
      const currentRevenue = revenueByCourse.get(courseKey) || 0;
      const amount = Number(purchase.amount || 0);
      revenueByCourse.set(courseKey, currentRevenue + amount);
      totalRevenue += amount;
    });

    const conversationsByCourse = new Map();
    const tutorLearners = new Set();
    let totalPromptMessages = 0;
    let totalConversationMessages = 0;
    const interactionBreakdown = {
      freeform: 0,
      summary: 0,
      example: 0,
      practice: 0,
      review: 0,
      quiz_errors: 0,
      retry_prep: 0,
    };

    conversations.forEach((conversation) => {
      const courseKey = String(conversation.courseId);
      const messageCount = conversation.messages?.length || 0;
      const userMessages = (conversation.messages || []).filter((message) => message.role === "user");
      const promptCount = userMessages.length;

      tutorLearners.add(String(conversation.userId));
      totalPromptMessages += promptCount;
      totalConversationMessages += messageCount;

      userMessages.forEach((message) => {
        const interactionType = message.interactionType || "freeform";
        if (interactionBreakdown[interactionType] !== undefined) {
          interactionBreakdown[interactionType] += 1;
        } else {
          interactionBreakdown.freeform += 1;
        }
      });

      const currentMetrics = conversationsByCourse.get(courseKey) || {
        conversations: 0,
        prompts: 0,
        learners: new Set(),
      };

      currentMetrics.conversations += 1;
      currentMetrics.prompts += promptCount;
      currentMetrics.learners.add(String(conversation.userId));
      conversationsByCourse.set(courseKey, currentMetrics);
    });

    const coursePerformance = courses.map((course) => {
      const courseKey = String(course._id);
      return {
        courseTitle: course.courseTitle,
        revenue: revenueByCourse.get(courseKey) || 0,
        students: studentsByCourse.get(courseKey)?.size || 0,
      };
    });

    const topTutorCourses = courses
      .map((course) => {
        const courseKey = String(course._id);
        const tutorCourseMetrics = conversationsByCourse.get(courseKey);

        return {
          courseTitle: course.courseTitle,
          conversations: tutorCourseMetrics?.conversations || 0,
          prompts: tutorCourseMetrics?.prompts || 0,
          learners: tutorCourseMetrics?.learners?.size || 0,
        };
      })
      .sort((left, right) => right.prompts - left.prompts)
      .slice(0, 5);

    const metrics = {
      totalCourses: courses.length,
      totalStudents: uniqueStudents.size,
      totalRevenue,
      coursePerformance,
      tutorMetrics: {
        totalConversations: conversations.length,
        totalLearnersUsingTutor: tutorLearners.size,
        totalPromptMessages,
        averageMessagesPerConversation: conversations.length
          ? Math.round(totalConversationMessages / conversations.length)
          : 0,
        interactionBreakdown,
        topTutorCourses,
      },
    };

    return sendSuccess(res, { metrics });
  } catch (error) {
    logger.error('Failed to fetch instructor metrics', { error: error.message, userId: req.id });
    return sendError(res, { status: 500, message: 'Failed to fetch instructor metrics' });
  }
};