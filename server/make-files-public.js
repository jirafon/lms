// make-files-public.js
import { PutObjectAclCommand, ListObjectsV2Command } from "@aws-sdk/client-s3";
import dotenv from "dotenv";
import { createS3Client, resolveS3BucketName } from "./utils/s3Config.js";

dotenv.config();

const s3 = createS3Client();

const makeFilesPublic = async () => {
  try {
    console.log('🔧 Making S3 files publicly accessible...');
    
    const bucketName = resolveS3BucketName();

    if (!bucketName) {
      console.error('❌ Missing S3 bucket configuration');
      return;
    }
    
    // List all objects in the bucket
    const listParams = {
      Bucket: bucketName,
    };
    
    console.log('📋 Listing all files in bucket...');
    const listResult = await s3.send(new ListObjectsV2Command(listParams));
    
    if (!listResult.Contents || listResult.Contents.length === 0) {
      console.log('📭 No files found in bucket');
      return;
    }
    
    console.log(`📁 Found ${listResult.Contents.length} files`);
    
    // Make each file public
    for (const object of listResult.Contents) {
      const key = object.Key;
      console.log(`🔓 Making public: ${key}`);
      
      try {
        const aclParams = {
          Bucket: bucketName,
          Key: key,
          ACL: 'public-read'
        };
        
        await s3.send(new PutObjectAclCommand(aclParams));
        console.log(`✅ Made public: ${key}`);
      } catch (error) {
        console.log(`❌ Failed to make public: ${key} - ${error.message}`);
      }
    }
    
    console.log('🎉 All files processed!');
    
  } catch (error) {
    console.error('❌ Error making files public:', error.message);
  }
};

// Run the script
makeFilesPublic(); 