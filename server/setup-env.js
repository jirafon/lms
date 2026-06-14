#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const envPath = path.join(__dirname, '.env');
const envExamplePath = path.join(__dirname, '.env.example');

console.log('🔧 LMS Environment Setup');
console.log('========================\n');

// Check if .env already exists
if (fs.existsSync(envPath)) {
  console.log('✅ .env file already exists');
  console.log('📁 Location:', envPath);
  console.log('\nCurrent environment variables:');
  
  const envContent = fs.readFileSync(envPath, 'utf8');
  const lines = envContent.split('\n').filter(line => line.trim() && !line.startsWith('#'));
  
  lines.forEach(line => {
    const [key] = line.split('=');
    console.log(`   ${key}`);
  });
  
  console.log('\n💡 To update variables, edit the .env file manually');
} else {
  console.log('❌ .env file not found');
  console.log('📝 Creating .env.example template...\n');
  
  const envTemplate = `# AWS S3 Configuration
AWS_ACCESS_KEY_ID=your_aws_access_key_id
AWS_SECRET_ACCESS_KEY=your_aws_secret_access_key
AWS_REGION=us-east-1
S3_BUCKET_NAME=your-s3-bucket-name

# CloudFront Configuration (optional)
CLOUDFRONT_DOMAIN=your-cloudfront-distribution-domain.cloudfront.net

# JWT Secret
JWT_SECRET=your_jwt_secret_key

# MongoDB URI
MONGODB_URI=mongodb://localhost:27017/lms

# Server Port
PORT=3010

# Public API base used to build proxied media URLs returned to the client
API_PUBLIC_BASE_URL=http://127.0.0.1:3081/api/v1

# Comma-separated emails that should always have instructor access
INSTRUCTOR_EMAILS=hello@unbiax.com
`;

  fs.writeFileSync(envExamplePath, envTemplate);
  
  console.log('✅ Created .env.example template');
  console.log('📁 Location:', envExamplePath);
  console.log('\n📋 Next steps:');
  console.log('1. Copy .env.example to .env');
  console.log('2. Update the values with your actual credentials');
  console.log('3. Restart your server');
  console.log('\n🔗 For S3 setup instructions, see: S3_CLOUDFRONT_SETUP.md');
}

console.log('\n🎥 Video Upload Status:');
const requiredVars = ['AWS_ACCESS_KEY_ID', 'AWS_SECRET_ACCESS_KEY', 'AWS_REGION', 'S3_BUCKET_NAME'];
const missingVars = [];

requiredVars.forEach(varName => {
  if (!process.env[varName]) {
    missingVars.push(varName);
  }
});

if (missingVars.length === 0) {
  console.log('✅ All S3 variables are configured');
  console.log('🎬 Videos should work correctly');
} else {
  console.log('❌ Missing S3 configuration:');
  missingVars.forEach(varName => {
    console.log(`   - ${varName}`);
  });
  console.log('\n🔧 Videos will not work until S3 is configured');
} 