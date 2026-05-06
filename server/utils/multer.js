import multer from "multer";
import path from "path";
import fs from "fs";
import { logger } from "./logger.js";
import { sendError } from "./apiResponse.js";

// Ensure uploads directory exists
const uploadsDir = "uploads/";
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Configure storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    logger.debug("Storing uploaded file", { directory: uploadsDir, fileName: file.originalname });
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    // Generate unique filename with timestamp
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    const name = path.basename(file.originalname, ext);
    const filename = `${name}-${uniqueSuffix}${ext}`;
    logger.debug("Generated upload filename", { originalName: file.originalname, filename });
    cb(null, filename);
  }
});

// File filter function
const fileFilter = (req, file, cb) => {
  logger.debug("Processing uploaded file", {
    fileName: file.originalname,
    mimeType: file.mimetype,
    size: file.size,
  });

  // Allow images
  if (file.mimetype.startsWith('image/')) {
    return cb(null, true);
  }
  
  // Allow videos
  if (file.mimetype.startsWith('video/')) {
    return cb(null, true);
  }
  
  // Allow documents
  const allowedDocumentTypes = [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-powerpoint',
    'application/vnd.openxmlformats-officedocument.presentationml.presentation'
  ];
  
  if (allowedDocumentTypes.includes(file.mimetype)) {
    return cb(null, true);
  }

  logger.warn("Rejected unsupported upload type", { fileName: file.originalname, mimeType: file.mimetype });
  cb(new Error(`File type not allowed: ${file.mimetype}`), false);
};

// Configure multer with limits
const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 100 * 1024 * 1024, // 100MB limit
    files: 1 // Only one file at a time
  }
});

// Error handling middleware
const handleMulterError = (error, req, res, next) => {
  if (error instanceof multer.MulterError) {
    logger.warn("Multer validation error", { code: error.code, message: error.message });
    if (error.code === 'LIMIT_FILE_SIZE') {
      return sendError(res, {
        status: 400,
        message: 'File too large. Maximum size is 100MB.',
        errors: ['fileSize'],
      });
    }
    if (error.code === 'LIMIT_FILE_COUNT') {
      return sendError(res, {
        status: 400,
        message: 'Too many files. Only one file allowed.',
        errors: ['files'],
      });
    }
    return sendError(res, {
      status: 400,
      message: `Upload error: ${error.message}`,
      errors: [error.code || error.message],
    });
  }
  
  if (error) {
    logger.warn("Upload rejected", { message: error.message });
    return sendError(res, {
      status: 400,
      message: error.message,
      errors: [error.message],
    });
  }
  
  next();
};

export { upload, handleMulterError };
export default upload;
