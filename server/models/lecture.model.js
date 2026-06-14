import mongoose from "mongoose";

const lectureSchema = new mongoose.Schema({
  lectureTitle: {
    type: String,
    required: true,
  },
  lectureDescription: {
    type: String,
    trim: true,
  },
  lectureOrder: {
    type: Number,
    default: 0,
    min: 0,
  },
  videoUrl: { type: String },
  s3Key: { type: String },
  publicId: { type: String },
  supportMaterials: [
    {
      name: { type: String, required: true },
      url: { type: String, required: true },
      s3Key: { type: String },
      key: { type: String },
    },
  ],
  isPreviewFree: { type: Boolean },
},{timestamps:true});

export const Lecture = mongoose.model("Lecture", lectureSchema);
