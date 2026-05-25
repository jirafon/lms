import { CopyObjectCommand, DeleteObjectCommand } from "@aws-sdk/client-s3";
import dotenv from 'dotenv';
import connectDB from './database/db.js';
import { Lecture } from './models/lecture.model.js';
import { createS3Client, resolveS3BucketName } from './utils/s3Config.js';

dotenv.config();

const s3 = createS3Client();

// Function to get correct content type
const getContentType = (filename) => {
  const ext = filename.toLowerCase().split('.').pop();
  const contentTypes = {
    'jpg': 'image/jpeg',
    'jpeg': 'image/jpeg',
    'png': 'image/png',
    'gif': 'image/gif',
    'webp': 'image/webp',
    'svg': 'image/svg+xml',
    'mp4': 'video/mp4',
    'avi': 'video/x-msvideo',
    'mov': 'video/quicktime',
    'wmv': 'video/x-ms-wmv',
    'flv': 'video/x-flv',
    'webm': 'video/webm'
  };
  return contentTypes[ext] || 'application/octet-stream';
};

// Function to extract S3 key from URL
const extractS3KeyFromUrl = (url) => {
  if (!url) return null;
  
  // Handle regional S3 URLs (e.g., s3.sa-east-1.amazonaws.com)
  if (url.includes('s3.') && url.includes('.amazonaws.com')) {
    const urlParts = url.split('/');
    // Remove protocol, bucket, and get key
    // URL format: https://bucket.s3.region.amazonaws.com/key
    const key = urlParts.slice(3).join('/');
    return key;
  }
  
  return null;
};

async function fixVideoContentTypes() {
  try {
    await connectDB();
    console.log('🔧 Fixing video content types in S3...\n');
    
    const bucketName = resolveS3BucketName();

    if (!bucketName) {
      console.error('❌ Missing S3 bucket configuration');
      return;
    }

    const lectures = await Lecture.find({ videoUrl: { $exists: true, $ne: null } });
    
    if (lectures.length === 0) {
      console.log('❌ No videos found in database');
      return;
    }
    
    console.log(`📚 Found ${lectures.length} lectures with videos:\n`);
    
    for (const lecture of lectures) {
      console.log(`🎥 Processing: ${lecture.lectureTitle}`);
      
      const key = extractS3KeyFromUrl(lecture.videoUrl);
      if (!key) {
        console.log('❌ Could not extract S3 key from URL');
        continue;
      }
      
      console.log(`🔑 S3 Key: ${key}`);
      
      // Get the correct content type
      const filename = key.split('/').pop(); // Get filename from key
      const correctContentType = getContentType(filename);
      console.log(`🔧 Correct content type: ${correctContentType}`);
      
      // Create a temporary key for the copy
      const tempKey = `${key}_temp_${Date.now()}`;
      
      try {
        // Copy the object with the correct content type
        console.log('📋 Copying object with correct content type...');
        const copyParams = {
          Bucket: bucketName,
          CopySource: `${bucketName}/${key}`,
          Key: tempKey,
          MetadataDirective: 'REPLACE',
          ContentType: correctContentType,
        };
        
        await s3.send(new CopyObjectCommand(copyParams));
        console.log('✅ Object copied successfully');
        
        // Delete the original object
        console.log('🗑️ Deleting original object...');
        const deleteParams = {
          Bucket: bucketName,
          Key: key,
        };
        
        await s3.send(new DeleteObjectCommand(deleteParams));
        console.log('✅ Original object deleted');
        
        // Copy back to original location
        console.log('📋 Copying back to original location...');
        const copyBackParams = {
          Bucket: bucketName,
          CopySource: `${bucketName}/${tempKey}`,
          Key: key,
          MetadataDirective: 'REPLACE',
          ContentType: correctContentType,
        };
        
        await s3.send(new CopyObjectCommand(copyBackParams));
        console.log('✅ Object copied back to original location');
        
        // Delete temporary object
        console.log('🗑️ Deleting temporary object...');
        const deleteTempParams = {
          Bucket: bucketName,
          Key: tempKey,
        };
        
        await s3.send(new DeleteObjectCommand(deleteTempParams));
        console.log('✅ Temporary object deleted');
        
        console.log('✅ Video content type fixed successfully!\n');
        
      } catch (error) {
        console.error('❌ Error fixing video content type:', error.message);
        console.log('');
      }
    }
    
    console.log('🎬 All videos processed!');
    console.log('💡 Try accessing the videos now - they should work correctly');
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    process.exit(0);
  }
}

fixVideoContentTypes(); 