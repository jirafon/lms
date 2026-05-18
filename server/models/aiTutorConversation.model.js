import mongoose from "mongoose";

const aiTutorMessageSchema = new mongoose.Schema(
  {
    role: {
      type: String,
      enum: ["user", "assistant"],
      required: true,
    },
    interactionType: {
      type: String,
      enum: ["freeform", "summary", "example", "practice", "review", "quiz_errors", "retry_prep", "system"],
      default: "freeform",
    },
    content: {
      type: String,
      required: true,
      trim: true,
    },
  },
  { _id: true, timestamps: true }
);

const aiTutorConversationSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    courseId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Course",
      required: true,
    },
    lectureId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Lecture",
      required: true,
    },
    messages: [aiTutorMessageSchema],
    lastActivityAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

aiTutorConversationSchema.index({ userId: 1, courseId: 1, lectureId: 1 }, { unique: true });

export const AITutorConversation = mongoose.model("AITutorConversation", aiTutorConversationSchema);