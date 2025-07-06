import multer from "multer";
import path from "path";
import fs from "fs";

// Ensure uploads directory exists
const uploadsDir = "uploads/";
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Configure storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    console.log(`📁 Multer: Storing file in ${uploadsDir}`);
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    // Generate unique filename with timestamp
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    const name = path.basename(file.originalname, ext);
    const filename = `${name}-${uniqueSuffix}${ext}`;
    console.log(`📝 Multer: Generated filename: ${filename}`);
    cb(null, filename);
  }
});

// File filter function
const fileFilter = (req, file, cb) => {
  console.log(`🔍 Multer: Processing file: ${file.originalname}`);
  console.log(`🔧 Multer: MIME type: ${file.mimetype}`);
  console.log(`📏 Multer: File size: ${file.size} bytes`);

  // Allow images
  if (file.mimetype.startsWith('image/')) {
    console.log(`✅ Multer: Image file accepted`);
    return cb(null, true);
  }
  
  // Allow videos
  if (file.mimetype.startsWith('video/')) {
    console.log(`✅ Multer: Video file accepted`);
    return cb(null, true);
  }
  
  // Allow specific video formats
  const allowedVideoTypes = [
    'video/mp4',
    'video/avi',
    'video/mov',
    'video/wmv',
    'video/flv',
    'video/webm'
  ];
  
  if (allowedVideoTypes.includes(file.mimetype)) {
    console.log(`✅ Multer: Video file accepted (${file.mimetype})`);
    return cb(null, true);
  }

  console.log(`❌ Multer: File type not allowed: ${file.mimetype}`);
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
    console.error(`❌ Multer error: ${error.code}`);
    if (error.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({
        success: false,
        message: 'File too large. Maximum size is 100MB.'
      });
    }
    if (error.code === 'LIMIT_FILE_COUNT') {
      return res.status(400).json({
        success: false,
        message: 'Too many files. Only one file allowed.'
      });
    }
    return res.status(400).json({
      success: false,
      message: `Upload error: ${error.message}`
    });
  }
  
  if (error) {
    console.error(`❌ Upload error: ${error.message}`);
    return res.status(400).json({
      success: false,
      message: error.message
    });
  }
  
  next();
};

export { upload, handleMulterError };
export default upload;
