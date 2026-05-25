// utils/s3.js

import { PutObjectCommand, DeleteObjectCommand } from "@aws-sdk/client-s3";
import dotenv from "dotenv";
import fs from "fs";
import { createS3Client, resolveS3BucketName, resolveS3Region } from "./s3Config.js";

dotenv.config();

const s3 = createS3Client();

// Custom function to encode URLs for S3 (using + for spaces instead of %20)
const encodeS3Url = (key) => {
  return key.replace(/\s/g, '+');
};

// Function to get content type based on file extension
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

export const uploadMedia = async (filePathOrBuffer, originalName) => {
  const bucketName = resolveS3BucketName();
  const region = resolveS3Region();

  if (!bucketName) {
    console.error("❌ S3 bucket configuration is not defined");
    throw new Error("S3 bucket configuration is not defined");
  }

  // Create a file key (you can customize this as needed)
  const fileKey = `user_photos/${Date.now()}-${originalName}`;
  
  console.log(`📤 Starting S3 upload: ${fileKey}`);
  console.log(`📁 File: ${originalName}`);
  console.log(`📂 File path: ${filePathOrBuffer}`);

  // Read the file properly
  let fileBuffer;
  try {
    if (typeof filePathOrBuffer === 'string') {
      // It's a file path, read the file
      console.log(`📖 Reading file from path: ${filePathOrBuffer}`);
      fileBuffer = fs.readFileSync(filePathOrBuffer);
      console.log(`📏 File size read: ${fileBuffer.length} bytes`);
    } else {
      // It's already a buffer
      fileBuffer = filePathOrBuffer;
      console.log(`📏 Buffer size: ${fileBuffer.length} bytes`);
    }
  } catch (error) {
    console.error(`❌ Error reading file: ${error.message}`);
    throw error;
  }

  // Get the correct content type
  const contentType = getContentType(originalName);
  console.log(`🔧 Content type: ${contentType}`);

  const uploadParams = {
    Bucket: bucketName,
    Key: fileKey,
    Body: fileBuffer,
    ContentType: contentType,
    // Remove the ACL line—S3 will use the bucket's policy instead:
    // ACL: "public-read",
  };

  try {
    const command = new PutObjectCommand(uploadParams);
    await s3.send(command);
    
    // Build a URL based on bucket/region. Adjust if your bucket uses a different endpoint.
    // IMPORTANT: Use custom encoding for S3 compatibility (spaces as +)
    const encodedKey = encodeS3Url(fileKey);
    const url = `https://${bucketName}.s3.${region}.amazonaws.com/${encodedKey}`;
    
    console.log(`✅ S3 upload successful: ${fileKey}`);
    
    return { key: fileKey, url };
  } catch (error) {
    console.error(`❌ S3 upload failed: ${fileKey}`);
    console.error(`🔍 Error details:`, error);
    throw error;
  }
};

export const uploadVideo = async (filePathOrBuffer, originalName) => {
  const bucketName = resolveS3BucketName();
  if (!bucketName) {
    console.error("❌ S3 bucket configuration is not defined");
    throw new Error("S3 bucket configuration is not defined");
  }

  // Create a file key for videos
  const fileKey = `videos/${Date.now()}-${originalName}`;
  
  console.log(`🎥 Starting S3 video upload: ${fileKey}`);
  console.log(`📁 Video: ${originalName}`);
  console.log(`📂 File path: ${filePathOrBuffer}`);

  // Read the file properly
  let fileBuffer;
  try {
    if (typeof filePathOrBuffer === 'string') {
      // It's a file path, read the file
      console.log(`📖 Reading video file from path: ${filePathOrBuffer}`);
      fileBuffer = fs.readFileSync(filePathOrBuffer);
      console.log(`📏 Video file size read: ${fileBuffer.length} bytes`);
    } else {
      // It's already a buffer
      fileBuffer = filePathOrBuffer;
      console.log(`📏 Video buffer size: ${fileBuffer.length} bytes`);
    }
  } catch (error) {
    console.error(`❌ Error reading video file: ${error.message}`);
    throw error;
  }

  // Get the correct content type for videos
  const contentType = getContentType(originalName);
  console.log(`🔧 Video content type: ${contentType}`);

  const uploadParams = {
    Bucket: bucketName,
    Key: fileKey,
    Body: fileBuffer,
    ContentType: contentType,
    // Remove the ACL line—S3 will use the bucket's policy instead:
    // ACL: "public-read",
  };

  try {
    const command = new PutObjectCommand(uploadParams);
    await s3.send(command);
    
    // Generate CloudFront URL if distribution domain is configured
    const cloudfrontDomain = process.env.CLOUDFRONT_DOMAIN;
    let url;
    
    if (cloudfrontDomain) {
      // For CloudFront, we need to encode the key properly
      const encodedKey = encodeS3Url(fileKey);
      url = `https://${cloudfrontDomain}/${encodedKey}`;
      console.log(`✅ S3 video upload successful (CloudFront): ${fileKey}`);
      console.log(`🔗 CloudFront URL: ${url}`);
    } else {
      // Fallback to S3 URL if CloudFront is not configured
      const region = resolveS3Region();
      // IMPORTANT: Use custom encoding for S3 compatibility (spaces as +)
      const encodedKey = encodeS3Url(fileKey);
      url = `https://${bucketName}.s3.${region}.amazonaws.com/${encodedKey}`;
      console.log(`✅ S3 video upload successful (S3): ${fileKey}`);
    }
    
    return { key: fileKey, url };
  } catch (error) {
    console.error(`❌ S3 video upload failed: ${fileKey}`);
    console.error(`🔍 Error details:`, error);
    throw error;
  }
};

export const extractS3KeyFromUrl = (url) => {
  if (!url) return null;
  
  console.log(`🔍 Extracting S3 key from URL: ${url}`);
  
  // Handle CloudFront URLs
  if (url.includes('cloudfront.net')) {
    const urlParts = url.split('/');
    const key = urlParts.slice(3).join('/'); // Remove protocol, domain, and get path
    console.log(`🔑 Extracted CloudFront key: ${key}`);
    return key;
  }
  
  // Handle regional S3 URLs (e.g., s3.sa-east-1.amazonaws.com)
  if (url.includes('s3.') && url.includes('.amazonaws.com')) {
    const urlParts = url.split('/');
    // Remove protocol, bucket, and get key
    // URL format: https://bucket.s3.region.amazonaws.com/key
    const key = urlParts.slice(3).join('/');
    console.log(`🔑 Extracted regional S3 key: ${key}`);
    return key;
  }
  
  // Handle legacy S3 URLs (e.g., s3.amazonaws.com)
  if (url.includes('s3.amazonaws.com')) {
    const urlParts = url.split('/');
    const key = urlParts.slice(3).join('/'); // Remove protocol, bucket, and get key
    console.log(`🔑 Extracted legacy S3 key: ${key}`);
    return key;
  }
  
  console.log(`❌ Could not extract key from URL: ${url}`);
  return null;
};

export const deleteMediaFromS3 = async (key) => {
  const bucketName = resolveS3BucketName();
  if (!bucketName) {
    console.warn("⚠️ S3 bucket configuration is not defined; skipping deletion.");
    return;
  }
  if (!key) {
    console.warn("⚠️ No S3 key provided; skipping deletion.");
    return;
  }

  console.log(`🗑️ Starting S3 deletion: ${key}`);

  try {
    const deleteParams = {
      Bucket: bucketName,
      Key: key,
    };
    await s3.send(new DeleteObjectCommand(deleteParams));
    console.log(`✅ S3 deletion successful: ${key}`);
  } catch (error) {
    console.error(`❌ S3 deletion failed: ${key}`);
    console.error(`🔍 Error details:`, error);
    throw error;
  }
};

export const deleteVideoFromS3 = async (key) => {
  try {
    const bucketName = resolveS3BucketName();
    if (!bucketName) {
      console.warn("⚠️ S3 bucket configuration is not defined; skipping video deletion.");
      return;
    }
    if (!key) {
      console.warn("⚠️ No S3 key provided; skipping video deletion.");
      return;
    }

    console.log(`🎥 Starting S3 video deletion: ${key}`);

    const deleteParams = {
      Bucket: bucketName,
      Key: key,
    };
    await s3.send(new DeleteObjectCommand(deleteParams));
    console.log(`✅ S3 video deletion successful: ${key}`);
  } catch (error) {
    console.error(`❌ S3 video deletion failed: ${key}`);
    console.error(`🔍 Error details:`, error);
    throw error;
  }
};
