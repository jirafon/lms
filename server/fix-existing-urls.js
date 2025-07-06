// fix-existing-urls.js
import mongoose from "mongoose";
import dotenv from "dotenv";
import { User } from "./models/user.model.js";
import { Course } from "./models/course.model.js";

dotenv.config();

const fixExistingUrls = async () => {
  try {
    console.log('🔧 Fixing existing URLs in database...');
    
    // Connect to MongoDB
    const mongoURI = process.env.MONGODB_URI || "mongodb://localhost:27017/lms";
    await mongoose.connect(mongoURI);
    console.log('✅ Connected to MongoDB');
    
    // Fix user photo URLs
    console.log('\n👤 Fixing user photo URLs:');
    const users = await User.find({ photoUrl: { $exists: true, $ne: null } });
    
    for (const user of users) {
      if (user.photoUrl && user.photoUrl.includes('s3.amazonaws.com')) {
        const oldUrl = user.photoUrl;
        // Extract the key from the URL
        const urlParts = oldUrl.split('/');
        const key = urlParts.slice(3).join('/'); // Remove protocol, bucket, and get key
        
        // Create new properly encoded URL
        const bucketName = process.env.S3_BUCKET_NAME;
        const region = process.env.AWS_REGION;
        const encodedKey = encodeURIComponent(key);
        const newUrl = `https://${bucketName}.s3.${region}.amazonaws.com/${encodedKey}`;
        
        if (oldUrl !== newUrl) {
          console.log(`User: ${user.name}`);
          console.log(`Old URL: ${oldUrl}`);
          console.log(`New URL: ${newUrl}`);
          
          // Update the user
          await User.findByIdAndUpdate(user._id, { photoUrl: newUrl });
          console.log('✅ Updated user photo URL');
        }
      }
    }
    
    // Fix course thumbnail URLs
    console.log('\n📚 Fixing course thumbnail URLs:');
    const courses = await Course.find({ courseThumbnail: { $exists: true, $ne: null } });
    
    for (const course of courses) {
      if (course.courseThumbnail && course.courseThumbnail.includes('s3.amazonaws.com')) {
        const oldUrl = course.courseThumbnail;
        // Extract the key from the URL
        const urlParts = oldUrl.split('/');
        const key = urlParts.slice(3).join('/'); // Remove protocol, bucket, and get key
        
        // Create new properly encoded URL
        const bucketName = process.env.S3_BUCKET_NAME;
        const region = process.env.AWS_REGION;
        const encodedKey = encodeURIComponent(key);
        const newUrl = `https://${bucketName}.s3.${region}.amazonaws.com/${encodedKey}`;
        
        if (oldUrl !== newUrl) {
          console.log(`Course: ${course.courseTitle}`);
          console.log(`Old URL: ${oldUrl}`);
          console.log(`New URL: ${newUrl}`);
          
          // Update the course
          await Course.findByIdAndUpdate(course._id, { courseThumbnail: newUrl });
          console.log('✅ Updated course thumbnail URL');
        }
      }
    }
    
    console.log('\n✅ URL fixing completed');
    
  } catch (error) {
    console.error('❌ Error fixing URLs:', error);
  } finally {
    await mongoose.disconnect();
  }
};

// Run the fix
fixExistingUrls(); 