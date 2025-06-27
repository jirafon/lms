import mongoose from "mongoose";

const lectureProgressSchema = new mongoose.Schema({
  lectureId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Lecture',
    required: true
  },
  watched: {
    type: Boolean,
    default: false
  },
  watchTime: {
    type: Number, // in seconds
    default: 0
  },
  completedAt: {
    type: Date
  },
  quizCompleted: {
    type: Boolean,
    default: false
  },
  quizScore: {
    type: Number,
    default: 0
  },
  quizAttempts: {
    type: Number,
    default: 0
  },
  bestQuizScore: {
    type: Number,
    default: 0
  }
}, { _id: true });

const courseProgressSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  courseId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Course',
    required: true
  },
  lectures: [lectureProgressSchema],
  totalLectures: {
    type: Number,
    default: 0
  },
  completedLectures: {
    type: Number,
    default: 0
  },
  totalQuizzes: {
    type: Number,
    default: 0
  },
  completedQuizzes: {
    type: Number,
    default: 0
  },
  averageQuizScore: {
    type: Number,
    default: 0
  },
  courseProgress: {
    type: Number, // percentage
    default: 0
  },
  certificateEarned: {
    type: Boolean,
    default: false
  },
  certificateIssuedAt: {
    type: Date
  },
  lastAccessedAt: {
    type: Date,
    default: Date.now
  },
  startedAt: {
    type: Date,
    default: Date.now
  },
  completedAt: {
    type: Date
  }
}, { timestamps: true });

// Compound index to ensure unique progress per user per course
courseProgressSchema.index({ userId: 1, courseId: 1 }, { unique: true });

export const CourseProgress = mongoose.model('CourseProgress', courseProgressSchema); 