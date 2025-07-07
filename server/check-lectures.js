import dotenv from 'dotenv';
import connectDB from './database/db.js';
import { Lecture } from './models/lecture.model.js';

dotenv.config();

async function checkLectures() {
  try {
    await connectDB();
    console.log('🔍 Checking lectures in database...\n');
    
    const lectures = await Lecture.find().limit(5);
    
    if (lectures.length === 0) {
      console.log('❌ No lectures found in database');
      return;
    }
    
    console.log(`📚 Found ${lectures.length} lectures:\n`);
    
    lectures.forEach((lecture, index) => {
      console.log(`Lecture ${index + 1}:`);
      console.log(`  ID: ${lecture._id}`);
      console.log(`  Title: ${lecture.lectureTitle}`);
      console.log(`  Video URL: ${lecture.videoUrl || '❌ No video'}`);
      console.log(`  Has Video: ${lecture.videoUrl ? '✅ Yes' : '❌ No'}`);
      console.log(`  Is Preview Free: ${lecture.isPreviewFree ? '✅ Yes' : '❌ No'}`);
      console.log('');
    });
    
    // Check if any lectures have videos
    const lecturesWithVideos = lectures.filter(lecture => lecture.videoUrl);
    console.log(`📊 Summary:`);
    console.log(`  Total lectures: ${lectures.length}`);
    console.log(`  Lectures with videos: ${lecturesWithVideos.length}`);
    console.log(`  Lectures without videos: ${lectures.length - lecturesWithVideos.length}`);
    
    if (lecturesWithVideos.length === 0) {
      console.log('\n❌ No lectures have videos uploaded');
      console.log('💡 You need to upload videos to lectures first');
    } else {
      console.log('\n✅ Some lectures have videos');
      console.log('🎬 Videos should be playable if URLs are correct');
    }
    
  } catch (error) {
    console.error('❌ Error checking lectures:', error);
  } finally {
    process.exit(0);
  }
}

checkLectures(); 