import express from "express";
import { upload, handleMulterError } from "../utils/multer.js";
import { uploadMedia, uploadVideo } from "../utils/s3.js";
import { sendError, sendSuccess } from "../utils/apiResponse.js";
import { logger } from "../utils/logger.js";

const router = express.Router();

router.route("/upload-video").post(
  upload.single("file"), 
  handleMulterError,
  async(req,res) => {
    if (!req.file) {
      return sendError(res, {
        status: 400,
        message: "No file uploaded",
        errors: ["file is required"],
      });
    }
    
    try {
        logger.info("Uploading video to S3", {
          fileName: req.file.originalname,
          mimeType: req.file.mimetype,
          size: req.file.size,
        });
        const result = await uploadVideo(req.file.path, req.file.originalname);

        return sendSuccess(res, {
            message:"Video uploaded successfully to S3.",
            data:result
        });
    } catch (error) {
        logger.error("Video upload failed", {
          error: error.message,
          fileName: req.file?.originalname,
          mimeType: req.file?.mimetype,
        });

        return sendError(res, {
            status: 500,
            message:"Error uploading video to S3",
            errors: [error.message],
        });
    }
});

router.route("/upload-support-material").post(
  upload.single("file"), 
  handleMulterError,
  async (req, res) => {
    if (!req.file) {
      return sendError(res, {
        status: 400,
        message: "No file uploaded",
        errors: ["file is required"],
      });
    }

    try {
      logger.info("Uploading support material to S3", {
        fileName: req.file.originalname,
        mimeType: req.file.mimetype,
        size: req.file.size,
      });
      const result = await uploadMedia(req.file.path, req.file.originalname);

      return sendSuccess(res, {
        message: "Support material uploaded successfully to S3.",
        data: result
      });
    } catch (error) {
      logger.error("Support material upload failed", {
        error: error.message,
        fileName: req.file?.originalname,
        mimeType: req.file?.mimetype,
      });

      return sendError(res, {
        status: 500,
        message: "Error uploading support material to S3",
        errors: [error.message],
      });
    }
  }
);

export default router;