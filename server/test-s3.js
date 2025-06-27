// test-s3.js - Test script for S3 configuration
import { uploadVideo, deleteVideoFromS3 } from './utils/s3.js';
import dotenv from 'dotenv';

dotenv.config();

const testS3Connection = async () => {
  try {
    console.log('Testing S3 configuration...');
    console.log('AWS Region:', process.env.AWS_REGION);
    console.log('S3 Bucket:', process.env.S3_BUCKET_NAME);
    console.log('CloudFront Domain:', process.env.CLOUDFRONT_DOMAIN || 'Not configured');
    
    // Test with a simple text file
    const testContent = 'This is a test file for S3 upload';
    const testFileName = `test-${Date.now()}.txt`;
    
    console.log('\nTesting video upload...');
    const result = await uploadVideo(Buffer.from(testContent), testFileName);
    
    console.log('Upload successful!');
    console.log('File key:', result.key);
    console.log('File URL:', result.url);
    
    // Test deletion
    console.log('\nTesting video deletion...');
    await deleteVideoFromS3(result.key);
    console.log('Deletion successful!');
    
    console.log('\n✅ S3 configuration is working correctly!');
    
  } catch (error) {
    console.error('❌ S3 configuration test failed:', error.message);
    console.log('\nPlease check:');
    console.log('1. AWS credentials are set correctly');
    console.log('2. S3 bucket exists and is accessible');
    console.log('3. IAM permissions are configured properly');
  }
};

testS3Connection(); 