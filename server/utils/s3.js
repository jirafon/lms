// utils/s3.js

import { S3Client, PutObjectCommand, DeleteObjectCommand } from "@aws-sdk/client-s3";
import dotenv from "dotenv";

dotenv.config();

const s3 = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});

export const uploadMedia = async (filePathOrBuffer, originalName) => {
  const bucketName = process.env.S3_BUCKET_NAME;
  if (!bucketName) {
    console.error("❌ S3_BUCKET_NAME env var is not defined");
    throw new Error("S3_BUCKET_NAME env var is not defined");
  }

  // Create a file key (you can customize this as needed)
  const fileKey = `user_photos/${Date.now()}-${originalName}`;
  
  console.log(`📤 Starting S3 upload: ${fileKey}`);
  console.log(`📁 File: ${originalName}`);
  console.log(`🪣 Bucket: ${bucketName}`);

  const uploadParams = {
    Bucket: bucketName,
    Key: fileKey,
    Body: filePathOrBuffer,
    // Remove the ACL line—S3 will use the bucket's policy instead:
    // ACL: "public-read",
  };

  try {
    const command = new PutObjectCommand(uploadParams);
    await s3.send(command);
    
    // Build a URL based on bucket/region. Adjust if your bucket uses a different endpoint.
    const region = process.env.AWS_REGION;
    const url = `https://${bucketName}.s3.${region}.amazonaws.com/${fileKey}`;
    
    console.log(`✅ S3 upload successful: ${fileKey}`);
    console.log(`🔗 URL: ${url}`);
    
    return { key: fileKey, url };
  } catch (error) {
    console.error(`❌ S3 upload failed: ${fileKey}`);
    console.error(`🔍 Error details:`, error);
    throw error;
  }
};

export const uploadVideo = async (filePathOrBuffer, originalName) => {
  const bucketName = process.env.S3_BUCKET_NAME;
  if (!bucketName) {
    console.error("❌ S3_BUCKET_NAME env var is not defined");
    throw new Error("S3_BUCKET_NAME env var is not defined");
  }

  // Create a file key for videos
  const fileKey = `videos/${Date.now()}-${originalName}`;
  
  console.log(`🎥 Starting S3 video upload: ${fileKey}`);
  console.log(`📁 Video: ${originalName}`);
  console.log(`🪣 Bucket: ${bucketName}`);

  const uploadParams = {
    Bucket: bucketName,
    Key: fileKey,
    Body: filePathOrBuffer,
    ContentType: 'video/mp4', // Adjust based on your video format
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
      url = `https://${cloudfrontDomain}/${fileKey}`;
      console.log(`✅ S3 video upload successful (CloudFront): ${fileKey}`);
      console.log(`🔗 CloudFront URL: ${url}`);
    } else {
      // Fallback to S3 URL if CloudFront is not configured
      const region = process.env.AWS_REGION;
      url = `https://${bucketName}.s3.${region}.amazonaws.com/${fileKey}`;
      console.log(`✅ S3 video upload successful (S3): ${fileKey}`);
      console.log(`🔗 S3 URL: ${url}`);
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
  
  // Handle S3 URLs
  if (url.includes('s3.amazonaws.com')) {
    const urlParts = url.split('/');
    const key = urlParts.slice(3).join('/'); // Remove protocol, bucket, and get key
    console.log(`🔑 Extracted S3 key: ${key}`);
    return key;
  }
  
  console.log(`❌ Could not extract key from URL: ${url}`);
  return null;
};

export const deleteMediaFromS3 = async (key) => {
  const bucketName = process.env.S3_BUCKET_NAME;
  if (!bucketName) {
    console.warn("⚠️ S3_BUCKET_NAME is not defined; skipping deletion.");
    return;
  }
  if (!key) {
    console.warn("⚠️ No S3 key provided; skipping deletion.");
    return;
  }

  console.log(`🗑️ Starting S3 deletion: ${key}`);
  console.log(`🪣 Bucket: ${bucketName}`);

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
    const bucketName = process.env.S3_BUCKET_NAME;
    if (!bucketName) {
      console.warn("⚠️ S3_BUCKET_NAME is not defined; skipping video deletion.");
      return;
    }
    if (!key) {
      console.warn("⚠️ No S3 key provided; skipping video deletion.");
      return;
    }

    console.log(`🎥 Starting S3 video deletion: ${key}`);
    console.log(`🪣 Bucket: ${bucketName}`);

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
