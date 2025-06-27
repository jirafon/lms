import mongoose from "mongoose";

const questionSchema = new mongoose.Schema({
  question: {
    type: String,
    required: true,
    trim: true
  },
  type: {
    type: String,
    enum: ['multiple_choice', 'true_false', 'short_answer'],
    default: 'multiple_choice'
  },
  options: [{
    text: String,
    isCorrect: Boolean
  }],
  correctAnswer: {
    type: String,
    required: function() { return this.type === 'short_answer'; }
  },
  points: {
    type: Number,
    default: 1
  },
  explanation: {
    type: String,
    trim: true
  }
}, { _id: true });

const quizSchema = new mongoose.Schema({
  lectureId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Lecture',
    required: true
  },
  courseId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Course',
    required: true
  },
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  questions: [questionSchema],
  timeLimit: {
    type: Number, // in minutes, 0 = no time limit
    default: 0
  },
  passingScore: {
    type: Number, // percentage required to pass
    default: 70
  },
  maxAttempts: {
    type: Number,
    default: 3
  },
  isActive: {
    type: Boolean,
    default: true
  },
  order: {
    type: Number,
    default: 0
  }
}, { timestamps: true });

export const Quiz = mongoose.model('Quiz', quizSchema); 