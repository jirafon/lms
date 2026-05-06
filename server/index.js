import express from "express";
import http from "http";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import cors from "cors";
import connectDB from "./database/db.js";
import userRoute from "./routes/user.route.js";
import courseRoute from "./routes/course.route.js";
import mediaRoute from "./routes/media.route.js";
import purchaseRoute from "./routes/purchaseCourse.route.js";
import courseProgressRoute from "./routes/courseProgress.route.js";
import quizRoute from "./routes/quiz.route.js";
import certificateRoute from "./routes/certificate.route.js";
import instructorRoutes from "./routes/instructor.route.js";
import { isProduction, logger } from "./utils/logger.js";

dotenv.config({});

// call database connection here
connectDB();
const app = express();

const configuredOrigins = [
  process.env.CORS_ORIGINS,
  process.env.CLIENT_URL,
  process.env.CLIENT_ORIGIN,
  process.env.FRONTEND_URL,
  process.env.FRONTEND_ORIGIN,
  process.env.VITE_CLIENT_URL,
]
  .filter(Boolean)
  .flatMap((value) => value.split(","))
  .map((value) => value.trim())
  .filter(Boolean);

const defaultDevOrigins = [
  "http://localhost:5173",
  "http://127.0.0.1:5173",
  "http://localhost:3000",
  "http://127.0.0.1:3000",
];

const allowedOrigins = new Set(
  isProduction ? configuredOrigins : [...configuredOrigins, ...defaultDevOrigins]
);

const isLocalDevOrigin = (origin) => {
  if (isProduction || !origin) {
    return false;
  }

  return /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(origin);
};

if (allowedOrigins.size === 0) {
  logger.warn("CORS allowlist is empty; all browser origins will be temporarily accepted.");
}

const corsOptions = {
  origin(origin, callback) {
    if (!origin) {
      return callback(null, true);
    }

    if (allowedOrigins.size === 0 || allowedOrigins.has(origin) || isLocalDevOrigin(origin)) {
      return callback(null, true);
    }

    logger.warn("Blocked CORS origin", { origin });
    return callback(new Error("Origin not allowed by CORS"));
  },
  credentials: true,
};


// default middleware with color-coded status logging
app.use((req, res, next) => {
  const start = Date.now();
  
  // Override res.end to capture the status code
  const originalEnd = res.end;
  res.end = function(chunk, encoding) {
    const duration = Date.now() - start;
    const status = res.statusCode;
    
    // Color codes for different status ranges
    let colorCode;
    if (status >= 200 && status < 300) {
      colorCode = '\x1b[32m'; // Green for 2xx
    } else if (status >= 400 && status < 500) {
      colorCode = '\x1b[31m'; // Red for 4xx
    } else if (status >= 500) {
      colorCode = '\x1b[35m'; // Magenta for 5xx
    } else {
      colorCode = '\x1b[33m'; // Yellow for other status codes
    }
    
    const resetColor = '\x1b[0m';
    logger.info(`${req.method} ${req.url} ${colorCode}${status}${resetColor} - ${duration}ms`);
    
    // Call the original end method
    originalEnd.call(this, chunk, encoding);
  };
  
  next();
});
app.use(express.json());
app.use(cookieParser());

app.use(cors(corsOptions));
app.options("*", cors(corsOptions));
 
// apis
app.use("/api/v1/media", mediaRoute);
app.use("/api/v1/user", userRoute);
app.use("/api/v1/course", courseRoute);
app.use("/api/v1/purchase", purchaseRoute);
app.use("/api/v1/progress", courseProgressRoute);
app.use("/api/v1/quiz", quizRoute);
app.use("/api/v1/certificate", certificateRoute);
app.use('/api/v1/instructor', instructorRoutes);
 
 
// Instead of hard‐coding a port, read from process.env.PORT:
const PORT = parseInt(process.env.PORT || '3000', 10);

const startServer = (port, attemptsRemaining = isProduction ? 1 : 5) => {
  const server = http.createServer(app);

  server.once("error", (error) => {
    if (error.code === "EADDRINUSE" && attemptsRemaining > 1) {
      const fallbackPort = port + 1;
      logger.warn("Port in use, retrying with next port", { port, fallbackPort });
      startServer(fallbackPort, attemptsRemaining - 1);
      return;
    }

    logger.error("Server failed to start", { error: error.message, port });
    process.exit(1);
  });

  server.once("listening", () => {
    logger.info(`Server is running on port ${port}`);
  });

  server.listen(port);
};

startServer(PORT);