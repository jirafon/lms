import express from "express";
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

dotenv.config({});

// call database connection here
connectDB();
const app = express();


// default middleware
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
});
app.use(express.json());
app.use(cookieParser());

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin) return callback(null, true); // Postman, curl, etc.
      callback(null, origin);                  // acepta siempre el Origin que venga
    },
    credentials: true,
  })
);
 
// apis
app.use("/api/v1/media", mediaRoute);
app.use("/api/v1/user", userRoute);
app.use("/api/v1/course", courseRoute);
app.use("/api/v1/purchase", purchaseRoute);
app.use("/api/v1/progress", courseProgressRoute);
app.use("/api/v1/quiz", quizRoute);
app.use("/api/v1/certificate", certificateRoute);
 
 
// Instead of hard‐coding a port, read from process.env.PORT:
const PORT = parseInt(process.env.PORT || '3000', 10);

// When you call listen, you don't need to explicitly pass "0.0.0.0"—
// Node defaults to 0.0.0.0 if you only pass a port. The important thing is
// that you do not bind to 'localhost' or '127.0.0.1' explicitly.
app.listen(PORT, () => {
  console.log(`🚀 Server is running on port ${PORT}`);
});