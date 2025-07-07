import dotenv from 'dotenv';
import connectDB from './database/db.js';
import { Lecture } from './models/lecture.model.js';
import { uploadVideo } from './utils/s3.js';
import fs from 'fs';
import path from 'path';

dotenv.config();

async function restoreVideos() {
  try {
    await connectDB();
    console.log('🔄 Restoring videos from uploads directory...\n');
    
    const uploadsDir = 'uploads/';
    
    // Check if uploads directory exists
    if (!fs.existsSync(uploadsDir)) {
      console.log('❌ Uploads directory not found');
      return;
    }
    
    // Get all video files in uploads directory
    const files = fs.readdirSync(uploadsDir);
    const videoFiles = files.filter(file => {
      const ext = path.extname(file).toLowerCase();
      return ['.mp4', '.mov', '.avi', '.wmv', '.flv', '.webm'].includes(ext);
    });
    
    console.log(`📁 Found ${videoFiles.length} video files in uploads directory:\n`);
    
    for (const file of videoFiles) {
      console.log(`🎥 Processing: ${file}`);
      const filePath = path.join(uploadsDir, file);
      const stats = fs.statSync(filePath);
      
      console.log(`📏 File size: ${stats.size} bytes`);
      
      if (stats.size < 1000) {
        console.log('⚠️ File too small, skipping...\n');
        continue;
      }
      
      try {
        // Upload to S3
        console.log('📤 Uploading to S3...');
        const result = await uploadVideo(filePath, file);
        
        console.log('✅ Upload successful!');
        console.log(`🔗 New URL: ${result.url}`);
        
        // Find matching lecture and update
        const lectures = await Lecture.find({});
        for (const lecture of lectures) {
          if (lecture.lectureTitle && lecture.lectureTitle.toLowerCase().includes('bienvenidas')) {
            console.log(`📝 Updating lecture: ${lecture.lectureTitle}`);
            lecture.videoUrl = result.url;
            await lecture.save();
            console.log('✅ Lecture updated successfully');
            break;
          }
        }
        
      } catch (error) {
        console.error(`❌ Error uploading ${file}:`, error.message);
      }
      
      console.log('');
    }
    
    console.log('🎬 Video restoration completed!');
    console.log('💡 Check the videos now - they should work correctly');
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    process.exit(0);
  }
}

restoreVideos(); 