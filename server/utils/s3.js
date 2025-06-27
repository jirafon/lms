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
    throw new Error("S3_BUCKET_NAME env var is not defined");
  }

  // Create a file key (you can customize this as needed)
  const fileKey = `user_photos/${Date.now()}-${originalName}`;

  const uploadParams = {
    Bucket: bucketName,
    Key: fileKey,
    Body: filePathOrBuffer,
    // Remove the ACL line—S3 will use the bucket's policy instead:
    // ACL: "public-read",
  };

  const command = new PutObjectCommand(uploadParams);
  await s3.send(command);

  // Build a URL based on bucket/region. Adjust if your bucket uses a different endpoint.
  const region = process.env.AWS_REGION;
  const url = `https://${bucketName}.s3.${region}.amazonaws.com/${fileKey}`;

  return { key: fileKey, url };
};

export const uploadVideo = async (filePathOrBuffer, originalName) => {
  const bucketName = process.env.S3_BUCKET_NAME;
  if (!bucketName) {
    throw new Error("S3_BUCKET_NAME env var is not defined");
  }

  // Create a file key for videos
  const fileKey = `videos/${Date.now()}-${originalName}`;

  const uploadParams = {
    Bucket: bucketName,
    Key: fileKey,
    Body: filePathOrBuffer,
    ContentType: 'video/mp4', // Adjust based on your video format
    // Remove the ACL line—S3 will use the bucket's policy instead:
    // ACL: "public-read",
  };

  const command = new PutObjectCommand(uploadParams);
  await s3.send(command);

  // Generate CloudFront URL if distribution domain is configured
  const cloudfrontDomain = process.env.CLOUDFRONT_DOMAIN;
  if (cloudfrontDomain) {
    const url = `https://${cloudfrontDomain}/${fileKey}`;
    return { key: fileKey, url };
  }

  // Fallback to S3 URL if CloudFront is not configured
  const region = process.env.AWS_REGION;
  const url = `https://${bucketName}.s3.${region}.amazonaws.com/${fileKey}`;

  return { key: fileKey, url };
};

export const extractS3KeyFromUrl = (url) => {
  if (!url) return null;
  
  // Handle CloudFront URLs
  if (url.includes('cloudfront.net')) {
    const urlParts = url.split('/');
    return urlParts.slice(3).join('/'); // Remove protocol, domain, and get path
  }
  
  // Handle S3 URLs
  if (url.includes('s3.amazonaws.com')) {
    const urlParts = url.split('/');
    return urlParts.slice(3).join('/'); // Remove protocol, bucket, and get key
  }
  
  return null;
};

export const deleteMediaFromS3 = async (key) => {
  const bucketName = process.env.S3_BUCKET_NAME;
  if (!bucketName) {
    console.warn("S3_BUCKET_NAME is not defined; skipping deletion.");
    return;
  }
  if (!key) {
    console.warn("No S3 key provided; skipping deletion.");
    return;
  }

  const deleteParams = {
    Bucket: bucketName,
    Key: key,
  };
  const command = new DeleteObjectCommand(deleteParams);
  return s3.send(command);
};

export const deleteVideoFromS3 = async (key) => {
  try {
    const bucketName = process.env.S3_BUCKET_NAME;
    if (!bucketName) {
      console.warn("S3_BUCKET_NAME is not defined; skipping deletion.");
      return;
    }
    if (!key) {
      console.warn("No S3 key provided; skipping deletion.");
      return;
    }

    const deleteParams = {
      Bucket: bucketName,
      Key: key,
    };
    await s3.send(new DeleteObjectCommand(deleteParams));
  } catch (error) {
    console.error("deleteVideoFromS3 error:", error);
    throw error;
  }
};
