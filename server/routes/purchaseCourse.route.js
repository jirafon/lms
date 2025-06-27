import express from "express";
import isAuthenticated from "../middlewares/isAuthenticated.js";
import { 
  createCheckoutSession, 
  getAllPurchasedCourse, 
  getCourseDetailWithPurchaseStatus, 
  stripeWebhook,
  capturePayPalPaymentHandler,
  paypalWebhook,
  getPaymentMethods
} from "../controllers/coursePurchase.controller.js";

const router = express.Router();

// Payment method selection
router.route("/payment-methods").get(getPaymentMethods);

// Create checkout session (supports both Stripe and PayPal)
router.route("/checkout/create-checkout-session").post(isAuthenticated, createCheckoutSession);

// PayPal payment capture
router.route("/paypal/capture").post(isAuthenticated, capturePayPalPaymentHandler);

// Webhooks
router.route("/webhook/stripe").post(express.raw({type:"application/json"}), stripeWebhook);
router.route("/webhook/paypal").post(express.json(), paypalWebhook);

// Course details with purchase status
router.route("/course/:courseId/detail-with-status").get(isAuthenticated, getCourseDetailWithPurchaseStatus);

// Get all purchased courses for the authenticated user
router.route("/").get(isAuthenticated, getAllPurchasedCourse);

export default router;