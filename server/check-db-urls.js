// check-db-urls.js
import mongoose from "mongoose";
import dotenv from "dotenv";
import { User } from "./models/user.model.js";
import { Course } from "./models/course.model.js";

dotenv.config();

const checkDatabaseUrls = async () => {
  try {
    console.log('🔍 Checking database URLs...');
    
    // Connect to MongoDB using the same config as the main server
    const mongoURI = process.env.MONGODB_URI || "mongodb://localhost:27017/lms";
    console.log('🔗 Connecting to MongoDB:', mongoURI);
    
    await mongoose.connect(mongoURI);
    console.log('✅ Connected to MongoDB');
    
    // Check user photos
    console.log('\n👤 Checking user photos:');
    const users = await User.find({ photoUrl: { $exists: true, $ne: null } }).select('name photoUrl');
    
    if (users.length === 0) {
      console.log('No users with photoUrl found');
    } else {
      users.forEach(user => {
        console.log(`User: ${user.name}`);
        console.log(`Photo URL: ${user.photoUrl}`);
        console.log('---');
      });
    }
    
    // Check course thumbnails
    console.log('\n📚 Checking course thumbnails:');
    const courses = await Course.find({ courseThumbnail: { $exists: true, $ne: null } }).select('courseTitle courseThumbnail');
    
    if (courses.length === 0) {
      console.log('No courses with courseThumbnail found');
    } else {
      courses.forEach(course => {
        console.log(`Course: ${course.courseTitle}`);
        console.log(`Thumbnail URL: ${course.courseThumbnail}`);
        console.log('---');
      });
    }
    
    console.log('\n✅ Database URL check completed');
    
  } catch (error) {
    console.error('❌ Error checking database URLs:', error);
  } finally {
    await mongoose.disconnect();
  }
};

// Run the check
checkDatabaseUrls(); 