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
const app = express();

const normalizeOrigin = (value) => {
  if (!value) {
    return null;
  }

  const trimmedValue = value.trim().replace(/\/+$/, "");

  if (!trimmedValue) {
    return null;
  }

  try {
    return new URL(trimmedValue).origin;
  } catch {
    if (/^[a-z0-9.-]+\.onrender\.com$/i.test(trimmedValue)) {
      return `https://${trimmedValue}`;
    }

    if (/^(localhost|127\.0\.0\.1)(:\d+)?$/i.test(trimmedValue)) {
      return `http://${trimmedValue}`;
    }

    return trimmedValue;
  }
};

const buildAllowedOriginPatterns = (origins) => {
  return origins
    .map((origin) => {
      try {
        const parsedOrigin = new URL(origin);
        const renderHostMatch = parsedOrigin.hostname.match(/^([^.]+)(-[a-z0-9]+)?\.onrender\.com$/i);

        if (!renderHostMatch) {
          return null;
        }

        return new RegExp(
          `^${parsedOrigin.protocol}//${renderHostMatch[1]}(?:-[a-z0-9]+)?\\.onrender\\.com$`,
          "i"
        );
      } catch {
        return null;
      }
    })
    .filter(Boolean);
};

const configuredOrigins = [
  process.env.CORS_ORIGINS,
  process.env.CLIENT_URL,
  process.env.CLIENT_ORIGIN,
  process.env.FRONTEND_URL,
  process.env.FRONTEND_ORIGIN,
  process.env.VITE_CLIENT_URL,
  process.env.PUBLIC_URL,
]
  .filter(Boolean)
  .flatMap((value) => value.split(","))
  .map(normalizeOrigin)
  .filter(Boolean);

const defaultDevOrigins = [
  "http://localhost:5173",
  "http://127.0.0.1:5173",
  "http://0.0.0.0:5173",
  "http://localhost:3000",
  "http://127.0.0.1:3000",
  "http://0.0.0.0:3000",
  "http://localhost:10000",
  "http://127.0.0.1:10000",
  "http://0.0.0.0:10000",
];

const allowedOrigins = new Set(
  isProduction ? configuredOrigins : [...configuredOrigins, ...defaultDevOrigins]
);
const allowedOriginPatterns = buildAllowedOriginPatterns(configuredOrigins);
const corsConfigSources = {
  CORS_ORIGINS: process.env.CORS_ORIGINS || null,
  CLIENT_URL: process.env.CLIENT_URL || null,
  CLIENT_ORIGIN: process.env.CLIENT_ORIGIN || null,
  FRONTEND_URL: process.env.FRONTEND_URL || null,
  FRONTEND_ORIGIN: process.env.FRONTEND_ORIGIN || null,
  VITE_CLIENT_URL: process.env.VITE_CLIENT_URL || null,
};

const isLocalDevOrigin = (origin) => {
  if (isProduction || !origin) {
    return false;
  }

  return /^https?:\/\/(localhost|127\.0\.0\.1|0\.0\.0\.0)(:\d+)?$/.test(origin);
};

if (allowedOrigins.size === 0) {
  logger.warn("CORS allowlist is empty; all browser origins will be temporarily accepted.");
} else {
  logger.info("CORS allowlist configured", {
    allowedOrigins: [...allowedOrigins],
    renderOriginPatterns: allowedOriginPatterns.map((pattern) => pattern.toString()),
    sources: corsConfigSources,
  });
}

const corsOptions = {
  origin(origin, callback) {
    const normalizedOrigin = normalizeOrigin(origin);

    if (!normalizedOrigin) {
      return callback(null, true);
    }

    if (
      allowedOrigins.size === 0 ||
      allowedOrigins.has(normalizedOrigin) ||
      allowedOriginPatterns.some((pattern) => pattern.test(normalizedOrigin)) ||
      isLocalDevOrigin(normalizedOrigin)
    ) {
      return callback(null, true);
    }

    logger.warn("Blocked CORS origin", { origin: normalizedOrigin, allowedOrigins: [...allowedOrigins] });
    return callback(new Error("Origin not allowed by CORS"));
  },
  credentials: true,
  methods: ["GET", "HEAD", "PUT", "PATCH", "POST", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"],
  optionsSuccessStatus: 204,
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

const bootstrap = async () => {
  try {
    await connectDB();
    startServer(PORT);
  } catch (error) {
    logger.error("Server startup aborted", { error: error.message });
    process.exit(1);
  }
};

bootstrap();