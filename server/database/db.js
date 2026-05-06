import mongoose from "mongoose";
import { logger } from "../utils/logger.js";

const connectDB = async () => {
    try {
        // Check for MongoDB URI in different possible environment variable names
        const mongoUri = process.env.MONGODB_URI || process.env.MONGO_URL || process.env.MONGODB_URL;
        
        if (!mongoUri) {
            logger.error("MongoDB URI not found in environment variables");
            throw new Error("MongoDB URI is required but not provided in environment variables");
        }
        
        logger.info("Attempting to connect to MongoDB");
        await mongoose.connect(mongoUri);
        logger.info("MongoDB connected");
    } catch (error) {
        logger.error("MongoDB connection error", { error: error.message });
        process.exit(1); // Stop the server if DB connection fails
    }
}
export default connectDB;