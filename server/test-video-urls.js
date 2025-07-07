import dotenv from 'dotenv';
import connectDB from './database/db.js';
import { Lecture } from './models/lecture.model.js';
import fetch from 'node-fetch';

dotenv.config();

async function testVideoUrls() {
  try {
    await connectDB();
    console.log('🎬 Testing video URLs...\n');
    
    const lectures = await Lecture.find({ videoUrl: { $exists: true, $ne: null } });
    
    if (lectures.length === 0) {
      console.log('❌ No videos found in database');
      return;
    }
    
    console.log(`📚 Found ${lectures.length} lectures with videos:\n`);
    
    for (const lecture of lectures) {
      console.log(`🎥 Testing: ${lecture.lectureTitle}`);
      console.log(`🔗 URL: ${lecture.videoUrl}`);
      
      try {
        // Test with HEAD request to check if video is accessible
        const response = await fetch(lecture.videoUrl, { method: 'HEAD' });
        
        console.log(`📊 Status: ${response.status} ${response.statusText}`);
        console.log(`🔧 Content-Type: ${response.headers.get('content-type')}`);
        console.log(`📏 Content-Length: ${response.headers.get('content-length')} bytes`);
        console.log(`🌐 Accept-Ranges: ${response.headers.get('accept-ranges')}`);
        
        if (response.ok) {
          console.log('✅ Video URL is accessible');
          
          // Test with GET request to check if video content is valid
          const getResponse = await fetch(lecture.videoUrl, { method: 'GET' });
          const buffer = await getResponse.buffer();
          
          console.log(`📦 Downloaded: ${buffer.length} bytes`);
          
          // Check if it's a valid video file (should have some content)
          if (buffer.length > 100) {
            console.log('✅ Video content appears valid');
          } else {
            console.log('⚠️ Video content seems too small, might be corrupted');
          }
          
        } else {
          console.log('❌ Video URL is not accessible');
          
          if (response.status === 403) {
            console.log('🔒 Access denied - Check S3 bucket permissions');
          } else if (response.status === 404) {
            console.log('🔍 File not found - Check if file exists in S3');
          } else {
            console.log('❓ Unknown error');
          }
        }
        
      } catch (error) {
        console.log(`❌ Error testing URL: ${error.message}`);
      }
      
      console.log('');
    }
    
    console.log('🎬 Video URL testing completed!');
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    process.exit(0);
  }
}

testVideoUrls(); 