// test-s3-access.js
import { S3Client, GetObjectCommand, HeadObjectCommand } from "@aws-sdk/client-s3";
import dotenv from "dotenv";

dotenv.config();

const s3 = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});

const testS3Access = async () => {
  try {
    console.log('🔍 Testing S3 bucket access...');
    console.log('Bucket:', process.env.S3_BUCKET_NAME);
    console.log('Region:', process.env.AWS_REGION);
    
    // Test a known file URL from your logs
    const testKey = 'user_photos/1751784337549-WhatsApp Image 2025-06-25 at 00.27.40 (3).jpeg';
    const bucketName = process.env.S3_BUCKET_NAME;
    
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
    
    // Test public URL access
    const publicUrl = `https://${bucketName}.s3.${process.env.AWS_REGION}.amazonaws.com/${testKey}`;
    console.log('\n🌐 Testing public URL access:');
    console.log('URL:', publicUrl);
    
    // You can test this URL manually in your browser
    console.log('\n📋 Manual test instructions:');
    console.log('1. Copy this URL and paste it in your browser:');
    console.log(publicUrl);
    console.log('\n2. If you see the image, S3 is configured correctly');
    console.log('3. If you get an error, the bucket policy needs to be updated');
    
  } catch (error) {
    console.error('❌ S3 access test failed:', error.message);
  }
};

// Run the test
testS3Access(); 