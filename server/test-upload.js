// test-upload.js
import { uploadMedia } from "./utils/s3.js";
import dotenv from "dotenv";
import fs from "fs";

dotenv.config();

const testUpload = async () => {
  try {
    console.log('🧪 Testing S3 upload process...');
    
    // Create a simple test file
    const testContent = 'This is a test image content';
    const testFileName = `test-image-${Date.now()}.txt`;
    const testFilePath = `./${testFileName}`;
    
    // Write test file
    fs.writeFileSync(testFilePath, testContent);
    console.log(`📁 Created test file: ${testFilePath}`);
    console.log(`📏 File size: ${fs.statSync(testFilePath).size} bytes`);
    
    // Upload to S3
    console.log('📤 Uploading test file to S3...');
    const result = await uploadMedia(testFilePath, testFileName);
    
    console.log('✅ Upload successful!');
    console.log('🔗 URL:', result.url);
    console.log('🔑 Key:', result.key);
    
    // Test the URL
    console.log('\n🌐 Testing URL accessibility...');
    const response = await fetch(result.url);
    console.log('Status:', response.status);
    console.log('Content-Length:', response.headers.get('content-length'));
    
    if (response.ok) {
      const content = await response.text();
      console.log('Content:', content);
      console.log('✅ URL is accessible and content is correct!');
    } else {
      console.log('❌ URL is not accessible');
    }
    
    // Clean up
    fs.unlinkSync(testFilePath);
    console.log('🧹 Cleaned up test file');
    
  } catch (error) {
    console.error('❌ Test failed:', error);
  }
};

// Run the test
testUpload(); 