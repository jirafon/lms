import dotenv from 'dotenv';
import connectDB from './database/db.js';
import { Lecture } from './models/lecture.model.js';

dotenv.config();

async function updateLectureUrls() {
  try {
    await connectDB();
    console.log('📝 Updating lecture URLs...\n');
    
    // New video URLs from the restoration
    const newVideos = [
      {
        title: 'como guardar una regulacion',
        newUrl: 'https://repoeticpro.s3.sa-east-1.amazonaws.com/videos/1751857899510-Grabacio%CC%81n+de+pantalla+2025-06-25+a+la(s)+12.26.15-1751852328360-610758181.mov'
      },
      {
        title: 'IA Para Directores',
        newUrl: 'https://repoeticpro.s3.sa-east-1.amazonaws.com/videos/1751857906821-_El_incumplimiento_de_V2-1751857634034-99079381.mp4'
      }
    ];
    
    for (const video of newVideos) {
      console.log(`🎥 Updating: ${video.title}`);
      
      // Find lecture by title
      const lecture = await Lecture.findOne({
        lectureTitle: { $regex: video.title, $options: 'i' }
      });
      
      if (lecture) {
        console.log(`📝 Found lecture: ${lecture.lectureTitle}`);
        console.log(`🔗 Old URL: ${lecture.videoUrl}`);
        console.log(`🔗 New URL: ${video.newUrl}`);
        
        lecture.videoUrl = video.newUrl;
        await lecture.save();
        
        console.log('✅ Lecture updated successfully\n');
      } else {
        console.log(`❌ Lecture not found for: ${video.title}\n`);
      }
    }
    
    console.log('🎬 All lecture URLs updated!');
    console.log('💡 Videos should work once S3 bucket is properly configured');
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    process.exit(0);
  }
}

updateLectureUrls(); 