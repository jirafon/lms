// make-files-public.js
import { S3Client, PutObjectAclCommand, ListObjectsV2Command } from "@aws-sdk/client-s3";
import dotenv from "dotenv";

dotenv.config();

const s3 = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});

const makeFilesPublic = async () => {
  try {
    console.log('🔧 Making S3 files publicly accessible...');
    console.log('Bucket:', process.env.S3_BUCKET_NAME);
    
    const bucketName = process.env.S3_BUCKET_NAME;
    
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