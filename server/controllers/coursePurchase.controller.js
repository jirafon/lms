import { Course } from "../models/course.model.js";
import { CoursePurchase } from "../models/coursePurchase.model.js";
// Payment providers are disabled for now; keep only data queries below.

export const createCheckoutSession = async (req, res) => {
  try {
    const { courseId } = req.body;

    const course = await Course.findById(courseId);
    if (!course) return res.status(404).json({ message: "Course not found!" });

    return res.status(501).json({
      success: false,
      message: "Payments are disabled for now. No provider configured.",
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message: "Payments are disabled for now.",
    });
  }
};

export const capturePayPalPaymentHandler = async (_req, res) => {
  return res.status(501).json({
    success: false,
    message: "Payments are disabled for now.",
  });
};

export const stripeWebhook = async (_req, res) => {
  console.log("Stripe webhook received but payments are disabled.");
  return res.status(200).send();
};

export const paypalWebhook = async (_req, res) => {
  console.log("PayPal webhook received but payments are disabled.");
  return res.status(200).send();
};

export const getCourseDetailWithPurchaseStatus = async (req, res) => {
  try {
    const { courseId } = req.params;
    const userId = req.id;

    const course = await Course.findById(courseId)
      .populate({ path: "creator" })
      .populate({ path: "lectures" });

    const purchased = await CoursePurchase.findOne({ 
      userId, 
      courseId,
      status: 'completed'
    });
    console.log(purchased);

    if (!course) {
      return res.status(404).json({ message: "course not found!" });
    }

    return res.status(200).json({
      course,
      purchased: !!purchased, // true if purchased, false otherwise
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

export const getAllPurchasedCourse = async (req, res) => {
  try {
    const userId = req.id;
    const purchasedCourse = await CoursePurchase.find({
      userId,
      status: "completed",
    }).populate("courseId");
    
    if (!purchasedCourse) {
      return res.status(200).json({
        purchasedCourse: [],
      });
    }
    return res.status(200).json({
      purchasedCourse,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

export const getPaymentMethods = async (_req, res) => {
  return res.status(200).json({
    success: true,
    paymentMethods: [],
    message: "Payments are disabled for now.",
  });
};
