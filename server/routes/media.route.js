import express from "express";
import { GetObjectCommand } from "@aws-sdk/client-s3";
import { upload, handleMulterError } from "../utils/multer.js";
import { uploadMedia, uploadVideo, resolveS3Key } from "../utils/s3.js";
import { createS3Client, resolveS3BucketName } from "../utils/s3Config.js";
import { sendError, sendSuccess } from "../utils/apiResponse.js";
import { logger } from "../utils/logger.js";

const router = express.Router();
const s3 = createS3Client();
const ALLOWED_PUBLIC_S3_PREFIXES = ["user_photos/"];

const isAllowedPublicS3Key = (key) =>
  typeof key === "string" &&
  ALLOWED_PUBLIC_S3_PREFIXES.some((prefix) => key.startsWith(prefix));

router.get("/asset", async (req, res) => {
  try {
    const rawKey = typeof req.query.key === "string" ? req.query.key.trim() : "";
    let key = resolveS3Key({ key: rawKey, url: rawKey });
    if (key) {
      key = key.replace(/\+/g, " ");
    }

    if (!key || !isAllowedPublicS3Key(key)) {
      return sendError(res, {
        status: 400,
        message: "Invalid media key",
      });
    }

    const bucketName = resolveS3BucketName();
    if (!bucketName) {
      return sendError(res, {
        status: 500,
        message: "S3 bucket configuration is not defined",
      });
    }

    const result = await s3.send(
      new GetObjectCommand({
        Bucket: bucketName,
        Key: key,
      })
    );

    res.setHeader("Content-Type", result.ContentType || "application/octet-stream");
    res.setHeader("Cache-Control", "public, max-age=3600");

    if (result.Body?.pipe) {
      result.Body.pipe(res);
      return;
    }

    const bytes = await result.Body.transformToByteArray();
    return res.status(200).send(Buffer.from(bytes));
  } catch (error) {
    if (error?.name === "NoSuchKey" || error?.$metadata?.httpStatusCode === 404) {
      return sendError(res, {
        status: 404,
        message: "Media not found",
      });
    }

    logger.error("Failed to stream media asset", {
      error: error.message,
      key: req.query?.key,
    });

    return sendError(res, {
      status: 500,
      message: "Failed to load media asset",
    });
  }
});

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