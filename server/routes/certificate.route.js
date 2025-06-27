import express from "express";
import isAuthenticated from "../middlewares/isAuthenticated.js";
import {
  generateCourseCertificate,
  checkCertificateEligibility,
  getUserCertificates
} from "../controllers/certificate.controller.js";

const router = express.Router();

// Check if user is eligible for certificate
router.route("/course/:courseId/eligibility").get(isAuthenticated, checkCertificateEligibility);

// Generate and download certificate
router.route("/course/:courseId/download").get(isAuthenticated, generateCourseCertificate);

// Get all user certificates
router.route("/user").get(isAuthenticated, getUserCertificates);

export default router; 