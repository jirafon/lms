import { Course } from "../models/course.model.js";
import { CoursePurchase } from "../models/coursePurchase.model.js";
import { logger } from "../utils/logger.js";
import { sendError, sendSuccess, getMissingFields } from "../utils/apiResponse.js";
import { isValidObjectId } from "../utils/validators.js";
// Payment providers are disabled for now; keep only data queries below.

const getOrderedLectures = (lectures = []) => {
  return lectures
    .map((lecture, index) => ({
      lecture,
      order: lecture.lectureOrder || index + 1,
    }))
    .sort((first, second) => first.order - second.order)
    .map(({ lecture }) => lecture);
};

export const createCheckoutSession = async (req, res) => {
  try {
    const { courseId } = req.body;

    const missingFields = getMissingFields({ courseId });
    if (missingFields.length > 0) {
      return sendError(res, {
        status: 400,
        message: "courseId is required",
        errors: missingFields,
      });
    }

    if (!isValidObjectId(courseId)) {
      return sendError(res, {
        status: 400,
        message: "Invalid course id",
        errors: ["courseId must be a valid id"],
      });
    }

    const course = await Course.findById(courseId);
    if (!course) {
      return sendError(res, { status: 404, message: "Course not found!" });
    }

    return sendError(res, {
      status: 501,
      message: "Payments are disabled for now. No provider configured.",
    });
  } catch (error) {
    logger.error("Failed to create checkout session", { error: error.message });
    return sendError(res, {
      status: 500,
      message: "Payments are disabled for now.",
    });
  }
};

export const capturePayPalPaymentHandler = async (_req, res) => {
  return sendError(res, {
    status: 501,
    message: "Payments are disabled for now.",
  });
};

export const stripeWebhook = async (_req, res) => {
  logger.info("Stripe webhook received but payments are disabled.");
  return res.sendStatus(200);
};

export const paypalWebhook = async (_req, res) => {
  logger.info("PayPal webhook received but payments are disabled.");
  return res.sendStatus(200);
};

export const getCourseDetailWithPurchaseStatus = async (req, res) => {
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

    const course = await Course.findById(courseId)
      .populate({ path: "creator" })
      .populate({ path: "lectures" });

    const purchased = await CoursePurchase.findOne({ 
      userId, 
      courseId,
      status: 'completed'
    });

    if (!course) {
      return sendError(res, { status: 404, message: "course not found!" });
    }

    course.lectures = getOrderedLectures(course.lectures);

    return sendSuccess(res, {
      course,
      purchased: !!purchased, // true if purchased, false otherwise
    });
  } catch (error) {
    logger.error("Failed to get course purchase status", { error: error.message, courseId: req.params.courseId });
    return sendError(res, { status: 500, message: "Internal server error" });
  }
};

export const getAllPurchasedCourse = async (req, res) => {
  try {
    const userId = req.id;
    const purchasedCourse = await CoursePurchase.find({
      userId,
      status: "completed",
    }).populate("courseId");

    return sendSuccess(res, {
      purchasedCourse: purchasedCourse.filter((purchase) => purchase.courseId),
    });
  } catch (error) {
    logger.error("Failed to get purchased courses", { error: error.message, userId: req.id });
    return sendError(res, { status: 500, message: "Internal server error" });
  }
};

export const getPaymentMethods = async (_req, res) => {
  return sendSuccess(res, {
    paymentMethods: [],
    message: "Payments are disabled for now.",
  });
};
