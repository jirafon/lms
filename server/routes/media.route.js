import express from "express";
import upload from "../utils/multer.js";
import { uploadVideo } from "../utils/s3.js";

const router = express.Router();

router.route("/upload-video").post(upload.single("file"), async(req,res) => {
    console.log("🎥 Video upload request received");
    console.log("📁 File:", req.file?.originalname);
    console.log("📏 Size:", req.file?.size, "bytes");
    console.log("🔧 MIME type:", req.file?.mimetype);
    
    try {
        console.log("🚀 Starting S3 upload process...");
        const result = await uploadVideo(req.file.path, req.file.originalname);
        
        console.log("✅ Video upload completed successfully");
        console.log("🔗 Final URL:", result.url);
        
        res.status(200).json({
            success:true,
            message:"Video uploaded successfully to S3.",
            data:result
        });
    } catch (error) {
        console.error("❌ Video upload failed");
        console.error("🔍 Error:", error.message);
        console.error("📋 Full error:", error);
        
        res.status(500).json({
            success: false,
            message:"Error uploading video to S3",
            error: error.message
        });
    }
});

export default router;