import mongoose from "mongoose";

const connectDB = async () => {
    try {
        // Check for MongoDB URI in different possible environment variable names
        const mongoUri = process.env.MONGODB_URI || process.env.MONGO_URL || process.env.MONGODB_URL;
        
        if (!mongoUri) {
            console.error("MongoDB URI not found in environment variables!");
            console.error("Available environment variables:", Object.keys(process.env));
            throw new Error("MongoDB URI is required but not provided in environment variables");
        }
        
        console.log('Attempting to connect to MongoDB...');
        await mongoose.connect(mongoUri);
        console.log('MongoDB Connected!');
    } catch (error) {
        console.error("MongoDB connection error:", error);
        process.exit(1); // Stop the server if DB connection fails
    }
}
export default connectDB;