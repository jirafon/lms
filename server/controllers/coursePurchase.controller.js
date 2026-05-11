import { Course } from "../models/course.model.js";
import { CoursePurchase } from "../models/coursePurchase.model.js";
import { User } from "../models/user.model.js";
import { logger } from "../utils/logger.js";
import { sendError, sendSuccess, getMissingFields } from "../utils/apiResponse.js";
import { isValidObjectId } from "../utils/validators.js";
import {
  createFlowPayment,
  getConfiguredFlowCurrency,
  getFlowPaymentStatus,
  isFlowConfigured,
} from "../utils/flow.js";

const getOrderedLectures = (lectures = []) => {
  return lectures
    .map((lecture, index) => ({
      lecture,
      order: lecture.lectureOrder || index + 1,
    }))
    .sort((first, second) => first.order - second.order)
    .map(({ lecture }) => lecture);
};

const FLOW_STATUS = {
  PENDING: 1,
  PAID: 2,
  REJECTED: 3,
  CANCELLED: 4,
};

const getPublicServerUrl = (req) => {
  const configuredUrl = process.env.SERVER_PUBLIC_URL || process.env.API_BASE_URL;

  if (configuredUrl) {
    return configuredUrl.replace(/\/+$/, "");
  }

  return `${req.protocol}://${req.get("host")}`;
};

const getClientBaseUrl = () => {
  return (
    process.env.CLIENT_URL ||
    process.env.CLIENT_ORIGIN ||
    process.env.FRONTEND_URL ||
    process.env.FRONTEND_ORIGIN ||
    "http://localhost:5173"
  ).replace(/\/+$/, "");
};

const mapFlowPaymentStatus = (statusCode) => {
  switch (Number(statusCode)) {
    case FLOW_STATUS.PAID:
      return "completed";
    case FLOW_STATUS.REJECTED:
      return "failed";
    case FLOW_STATUS.CANCELLED:
      return "cancelled";
    case FLOW_STATUS.PENDING:
    default:
      return "pending";
  }
};

const buildCommerceOrder = ({ courseId, userId }) => {
  return `course-${courseId.slice(-6)}-${userId.slice(-6)}-${Date.now()}`;
};

const buildFlowRedirectUrl = ({ courseId, status, token }) => {
  const redirectUrl = new URL(`${getClientBaseUrl()}/course-detail/${courseId}`);
  redirectUrl.searchParams.set("payment", "flow");
  redirectUrl.searchParams.set("status", status);

  if (token) {
    redirectUrl.searchParams.set("token", token);
  }

  return redirectUrl.toString();
};

const resolveOptionalPayload = (value) => {
  if (!value) {
    return null;
  }

  if (typeof value === "object") {
    return value;
  }

  try {
    return JSON.parse(value);
  } catch {
    return null;
  }
};

const syncEnrollment = async (purchaseDocument) => {
  if (purchaseDocument.status !== "completed") {
    return;
  }

  await Promise.all([
    User.updateOne(
      { _id: purchaseDocument.userId },
      { $addToSet: { enrolledCourses: purchaseDocument.courseId } }
    ),
    Course.updateOne(
      { _id: purchaseDocument.courseId },
      { $addToSet: { enrolledStudents: purchaseDocument.userId } }
    ),
  ]);
};

const findPurchaseFromFlowStatus = async (paymentStatus) => {
  const flowOrder = paymentStatus?.flowOrder ? String(paymentStatus.flowOrder) : null;
  const optional = resolveOptionalPayload(paymentStatus?.optional);
  const lookupClauses = [];

  if (flowOrder) {
    lookupClauses.push({ paymentId: flowOrder });
    lookupClauses.push({ "paymentDetails.flowOrder": flowOrder });
  }

  if (paymentStatus?.token) {
    lookupClauses.push({ "paymentDetails.token": paymentStatus.token });
  }

  if (paymentStatus?.commerceOrder) {
    lookupClauses.push({ "paymentDetails.commerceOrder": paymentStatus.commerceOrder });
  }

  if (lookupClauses.length > 0) {
    const existingPurchase = await CoursePurchase.findOne({ $or: lookupClauses }).sort({ createdAt: -1 });
    if (existingPurchase) {
      return existingPurchase;
    }
  }

  if (optional?.courseId && optional?.userId) {
    return CoursePurchase.findOne({
      courseId: optional.courseId,
      userId: optional.userId,
      paymentMethod: "flow",
    }).sort({ createdAt: -1 });
  }

  return null;
};

const applyFlowStatusToPurchase = async (paymentStatus, token) => {
  const purchase = await findPurchaseFromFlowStatus({ ...paymentStatus, token });

  if (!purchase) {
    logger.warn("Flow payment status received without matching purchase", {
      token,
      flowOrder: paymentStatus?.flowOrder,
      commerceOrder: paymentStatus?.commerceOrder,
    });
    return null;
  }

  purchase.status = mapFlowPaymentStatus(paymentStatus?.status);
  purchase.paymentId = String(paymentStatus?.flowOrder || purchase.paymentId);
  purchase.paymentMethod = "flow";
  purchase.paymentDetails = {
    ...purchase.paymentDetails,
    token,
    flowOrder: String(paymentStatus?.flowOrder || purchase.paymentDetails?.flowOrder || ""),
    commerceOrder: paymentStatus?.commerceOrder || purchase.paymentDetails?.commerceOrder,
    requestDate: paymentStatus?.requestDate,
    currency: paymentStatus?.currency,
    payer: paymentStatus?.payer,
    paymentData: paymentStatus?.paymentData || purchase.paymentDetails?.paymentData,
    pendingInfo: paymentStatus?.pending_info || purchase.paymentDetails?.pendingInfo,
    providerStatus: paymentStatus?.status,
    rawStatus: paymentStatus,
  };
  await purchase.save();
  await syncEnrollment(purchase);

  return purchase;
};

const processFlowToken = async (token) => {
  const paymentStatus = await getFlowPaymentStatus(token);
  const purchase = await applyFlowStatusToPurchase(paymentStatus, token);

  return { paymentStatus, purchase };
};

export const createCheckoutSession = async (req, res) => {
  try {
    const { courseId } = req.body;
    const userId = req.id;

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

    if (!isFlowConfigured()) {
      return sendError(res, {
        status: 501,
        message: "Flow payment provider is not configured.",
      });
    }

    const existingPurchase = await CoursePurchase.findOne({
      userId,
      courseId,
      status: "completed",
    });

    if (existingPurchase) {
      return sendError(res, {
        status: 409,
        message: "You already purchased this course.",
      });
    }

    const user = await User.findById(userId).select("name email");
    if (!user?.email) {
      return sendError(res, {
        status: 400,
        message: "The authenticated user must have a valid email to create a payment.",
      });
    }

    const amount = Number(course.coursePrice ?? 0);
    if (!Number.isFinite(amount) || amount <= 0) {
      return sendError(res, {
        status: 400,
        message: "Course price must be greater than zero to create a payment.",
      });
    }

    const commerceOrder = buildCommerceOrder({ courseId, userId });
    const serverBaseUrl = getPublicServerUrl(req);
    const confirmationUrl = `${serverBaseUrl}/api/v1/purchase/flow/confirm`;
    const returnUrl = `${serverBaseUrl}/api/v1/purchase/flow/return?courseId=${courseId}`;
    const currency = getConfiguredFlowCurrency(course.currency);
    const flowResponse = await createFlowPayment({
      commerceOrder,
      subject: (course.courseTitle || "Course purchase").slice(0, 255),
      currency,
      amount,
      email: user.email,
      urlConfirmation: confirmationUrl,
      urlReturn: returnUrl,
      optional: {
        courseId,
        userId,
      },
    });

    await CoursePurchase.findOneAndUpdate(
      {
        userId,
        courseId,
        status: "pending",
        paymentMethod: "flow",
      },
      {
        courseId,
        userId,
        amount,
        status: "pending",
        paymentId: String(flowResponse.flowOrder),
        paymentMethod: "flow",
        paymentDetails: {
          token: flowResponse.token,
          url: flowResponse.url,
          flowOrder: String(flowResponse.flowOrder),
          commerceOrder,
          currency,
        },
      },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    return sendSuccess(res, {
      message: "Flow checkout created successfully.",
      url: `${flowResponse.url}?token=${flowResponse.token}`,
      provider: "flow",
    });
  } catch (error) {
    logger.error("Failed to create checkout session", { error: error.message });
    return sendError(res, {
      status: 500,
      message: error.message || "Failed to create Flow checkout session.",
    });
  }
};

export const flowConfirmationHandler = async (req, res) => {
  const token = req.body?.token || req.query?.token;

  if (!token) {
    logger.warn("Flow confirmation received without token");
    return res.sendStatus(400);
  }

  try {
    await processFlowToken(token);
    return res.sendStatus(200);
  } catch (error) {
    logger.error("Failed to process Flow confirmation", { error: error.message, token });
    return res.sendStatus(500);
  }
};

export const flowReturnHandler = async (req, res) => {
  const token = req.body?.token || req.query?.token;
  const requestedCourseId = req.query?.courseId;

  if (!token) {
    const fallbackRedirect = requestedCourseId
      ? `${getClientBaseUrl()}/course-detail/${requestedCourseId}?payment=flow&status=missing-token`
      : `${getClientBaseUrl()}/`;
    return res.redirect(fallbackRedirect);
  }

  try {
    const { purchase } = await processFlowToken(token);
    const courseId = purchase?.courseId ? String(purchase.courseId) : requestedCourseId;
    const status = purchase?.status || "pending";

    return res.redirect(buildFlowRedirectUrl({ courseId, status, token }));
  } catch (error) {
    logger.error("Failed to process Flow return", { error: error.message, token });
    const fallbackRedirect = requestedCourseId
      ? `${getClientBaseUrl()}/course-detail/${requestedCourseId}?payment=flow&status=failed`
      : `${getClientBaseUrl()}/`;
    return res.redirect(fallbackRedirect);
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
    paymentMethods: isFlowConfigured()
      ? [
          {
            id: "flow",
            name: "Flow",
            currency: process.env.FLOW_CURRENCY || "CLP",
          },
        ]
      : [],
    message: isFlowConfigured()
      ? "Flow payment provider available."
      : "Flow payment provider is not configured.",
  });
};
