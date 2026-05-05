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
  videoUrl: { type: String },
  publicId: { type: String },
  supportMaterials: [
    {
      name: { type: String, required: true },
      url: { type: String, required: true },
      key: { type: String },
    },
  ],
  isPreviewFree: { type: Boolean },
},{timestamps:true});

export const Lecture = mongoose.model("Lecture", lectureSchema);
