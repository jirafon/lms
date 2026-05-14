import mongoose from "mongoose";
import { logger } from "../utils/logger.js";

mongoose.set("bufferCommands", false);

const connectDB = async () => {
    try {
        // Check for MongoDB URI in different possible environment variable names
        const mongoUri = process.env.MONGODB_URI || process.env.MONGO_URL || process.env.MONGODB_URL;
        
        if (!mongoUri) {
            logger.error("MongoDB URI not found in environment variables");
            throw new Error("MongoDB URI is required but not provided in environment variables");
        }

        const usesSrv = mongoUri.startsWith("mongodb+srv://");
        const redactedUri = mongoUri.replace(/:\/\/([^:]+):([^@]+)@/, "://$1:***@");
        
        logger.info("Attempting to connect to MongoDB", {
            mongoUri: redactedUri,
            usesSrv,
        });

        await mongoose.connect(mongoUri, {
            serverSelectionTimeoutMS: 10000,
            connectTimeoutMS: 10000,
            socketTimeoutMS: 45000,
        });

        logger.info("MongoDB connected", {
            host: mongoose.connection.host,
            name: mongoose.connection.name,
        });
        return mongoose.connection;
    } catch (error) {
        const usesSrv = Boolean(
            (process.env.MONGODB_URI || process.env.MONGO_URL || process.env.MONGODB_URL || "").startsWith("mongodb+srv://")
        );

        logger.error("MongoDB connection error", {
            error: error.message,
            name: error.name,
            code: error.code || null,
            usesSrv,
            hint: usesSrv && /queryTxt|ENOTFOUND|ETIMEOUT/i.test(error.message)
                ? "DNS resolution for MongoDB Atlas failed. Verify outbound DNS/network access and the Atlas connection string on the host."
                : undefined,
        });

        throw error;
    }
}
export default connectDB;