import mongoose from "mongoose";

const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('MongoDB Connected!');
    } catch (error) {
        console.error("MongoDB connection error:", error);
        process.exit(1); // Stop the server if DB connection fails
    }
}
export default connectDB;