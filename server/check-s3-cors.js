import { GetBucketCorsCommand } from "@aws-sdk/client-s3";
import dotenv from 'dotenv';
import { createS3Client, resolveS3BucketName } from './utils/s3Config.js';

dotenv.config();

const s3 = createS3Client();

async function checkS3Cors() {
  const bucketName = resolveS3BucketName();

  if (!bucketName) {
    console.error('❌ Missing S3 bucket configuration');
    return;
  }
  
  console.log('🔍 Checking S3 CORS Configuration');
  console.log('==================================\n');
  
  try {
    const corsCommand = new GetBucketCorsCommand({ Bucket: bucketName });
    const corsResult = await s3.send(corsCommand);
    
    console.log('✅ CORS configuration found:');
    corsResult.CORSRules.forEach((rule, index) => {
      console.log(`\nRule ${index + 1}:`);
      console.log(`  Allowed Origins: ${rule.AllowedOrigins.join(', ')}`);
      console.log(`  Allowed Methods: ${rule.AllowedMethods.join(', ')}`);
      console.log(`  Allowed Headers: ${rule.AllowedHeaders.join(', ')}`);
      console.log(`  Expose Headers: ${rule.ExposeHeaders.join(', ')}`);
      console.log(`  Max Age: ${rule.MaxAgeSeconds || 'Not set'}`);
    });
    
  } catch (error) {
    if (error.name === 'NoSuchCORSConfiguration') {
      console.log('❌ No CORS configuration found');
      console.log('💡 You should add CORS configuration for web access');
      
      console.log('\n🔧 Recommended CORS Configuration:');
      console.log(JSON.stringify({
        "CORSRules": [
          {
            "AllowedHeaders": ["*"],
            "AllowedMethods": ["GET", "PUT", "POST", "DELETE", "HEAD"],
            "AllowedOrigins": ["*"],
            "ExposeHeaders": ["ETag"]
          }
        ]
      }, null, 2));
      
    } else {
      console.log('❌ Error retrieving CORS configuration:', error.message);
    }
  }
  
  console.log('\n📋 CORS Setup Instructions:');
  console.log('1. Go to AWS S3 Console');
  console.log('2. Select the configured bucket');
  console.log('3. Go to "Permissions" tab');
  console.log('4. Scroll down to "Cross-origin resource sharing (CORS)"');
  console.log('5. Click "Edit" and add the CORS configuration above');
  console.log('6. Save the configuration');
}

checkS3Cors().catch(console.error); 