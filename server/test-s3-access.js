// test-s3-access.js
import { HeadObjectCommand } from "@aws-sdk/client-s3";
import dotenv from "dotenv";
import { createS3Client, resolveS3BucketName } from "./utils/s3Config.js";

dotenv.config();

const s3 = createS3Client();

const testS3Access = async () => {
  try {
    console.log('🔍 Testing S3 bucket access...');
    
    // Test a known file URL from your logs
    const testKey = 'user_photos/1751784337549-WhatsApp Image 2025-06-25 at 00.27.40 (3).jpeg';
    const bucketName = resolveS3BucketName();

    if (!bucketName) {
      console.error('❌ Missing S3 bucket configuration');
      return;
    }
    
    console.log('\n📁 Testing file access:', testKey);
    
    // Test HEAD request (check if file exists and is accessible)
    const headParams = {
      Bucket: bucketName,
      Key: testKey,
    };
    
    try {
      const headResult = await s3.send(new HeadObjectCommand(headParams));
      console.log('✅ File exists and is accessible');
      console.log('Content-Type:', headResult.ContentType);
      console.log('Content-Length:', headResult.ContentLength);
      console.log('LastModified:', headResult.LastModified);
    } catch (headError) {
      console.log('❌ File not accessible via S3 client');
      console.log('Error:', headError.message);
    }
    
  } catch (error) {
    console.error('❌ S3 access test failed:', error.message);
  }
};

// Run the test
testS3Access(); 