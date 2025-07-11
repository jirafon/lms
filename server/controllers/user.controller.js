import {User} from "../models/user.model.js";
import bcrypt from "bcryptjs";
import { generateToken } from "../utils/generateToken.js";
import { deleteMediaFromS3, uploadMedia, extractS3KeyFromUrl } from "../utils/s3.js";

export const register = async (req,res) => {
    try {
       
        const {name, email, password} = req.body; // patel214
        if(!name || !email || !password){
            return res.status(400).json({
                success:false,
                message:"All fields are required."
            })
        }
        const user = await User.findOne({email});
        if(user){
            return res.status(400).json({
                success:false,
                message:"User already exist with this email."
            })
        }
        const hashedPassword = await bcrypt.hash(password, 10);
        await User.create({
            name,
            email,
            password:hashedPassword
        });
        return res.status(201).json({
            success:true,
            message:"Account created successfully."
        })
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            success:false,
            message:"Failed to register"
        })
    }
}
export const login = async (req,res) => {
    try {
        const {email, password} = req.body;
        if(!email || !password){
            return res.status(400).json({
                success:false,
                message:"All fields are required."
            })
        }
        const user = await User.findOne({email});
        if(!user){
            return res.status(400).json({
                success:false,
                message:"Incorrect email or password"
            })
        }
        const isPasswordMatch = await bcrypt.compare(password, user.password);
        if(!isPasswordMatch){
            return res.status(400).json({
                success:false,
                message:"Incorrect email or password"
            });
        }
        generateToken(res, user, `Welcome back ${user.name}`);

    } catch (error) {
        console.log(error);
        return res.status(500).json({
            success:false,
            message:"Failed to login"
        })
    }
}
export const logout = async (_,res) => {
    try {
        return res.status(200).cookie("token", "", {maxAge:0}).json({
            message:"Logged out successfully.",
            success:true
        })
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            success:false,
            message:"Failed to logout"
        }) 
    }
}
export const getUserProfile = async (req,res) => {
    try {
        const userId = req.id;
        const user = await User.findById(userId).select("-password").populate("enrolledCourses");
        if(!user){
            return res.status(404).json({
                message:"Profile not found",
                success:false
            })
        }
        return res.status(200).json({
            success:true,
            user
        })
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            success:false,
            message:"Failed to load user"
        })
    }
}
export const updateProfile = async (req,res) => {
    try {
        const userId = req.id;
        const {name} = req.body;
        const profilePhoto = req.file;

        console.log("👤 Profile update request for user:", userId);
        console.log("📁 New photo file:", profilePhoto?.originalname);

        const user = await User.findById(userId);
        if(!user){
            return res.status(404).json({
                message:"User not found",
                success:false
            }) 
        }
        
        console.log("👤 Current user photo URL:", user.photoUrl);
        
        // Delete old photo from S3 if it exists
        if(user.photoUrl && (user.photoUrl.includes('s3') || user.photoUrl.includes('cloudfront'))){
            console.log("🗑️ Attempting to delete old photo from S3");
            const key = extractS3KeyFromUrl(user.photoUrl);
            console.log("🔑 Extracted key for deletion:", key);
            if (key) {
                await deleteMediaFromS3(key);
                console.log("✅ Old photo deleted successfully");
            } else {
                console.log("⚠️ Could not extract key, skipping deletion");
            }
        } else if(user.photoUrl) {
            console.log("ℹ️ Old photo is not from S3, skipping deletion");
        }

        // Upload new photo to S3
        console.log("📤 Uploading new photo to S3...");
        const s3Response = await uploadMedia(profilePhoto.path, profilePhoto.originalname);
        const photoUrl = s3Response.url;
        console.log("✅ New photo uploaded, URL:", photoUrl);

        const updatedData = {name, photoUrl};
        const updatedUser = await User.findByIdAndUpdate(userId, updatedData, {new:true}).select("-password");

        console.log("✅ Profile updated successfully");

        return res.status(200).json({
            success:true,
            user:updatedUser,
            message:"Profile updated successfully."
        })

    } catch (error) {
        console.error("❌ Profile update failed:", error);
        return res.status(500).json({
            success:false,
            message:"Failed to update profile"
        })
    }
}