import express from "express";
import upload from "../utils/multer.js";
import { uploadVideo } from "../utils/s3.js";

const router = express.Router();

router.route("/upload-video").post(upload.single("file"), async(req,res) => {
    try {
        const result = await uploadVideo(req.file.path, req.file.originalname);
        res.status(200).json({
            success:true,
            message:"Video uploaded successfully to S3.",
            data:result
        });
    } catch (error) {
        console.log(error);
        res.status(500).json({message:"Error uploading video to S3"})
    }
});
export default router;