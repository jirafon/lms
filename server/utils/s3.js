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

export const isS3MediaUrl = (url) => {
  if (!url) return false;
  return (
    url.includes("s3") ||
    url.includes("cloudfront") ||
    url.includes("amazonaws.com")
  );
};

export const isLegacyExternalMediaUrl = (url) => {
  if (!url || typeof url !== "string") {
    return false;
  }

  return url.includes("cloudinary.com") || url.includes("res.cloudinary");
};

export const looksLikeS3Key = (value) => {
  if (!value || typeof value !== "string") return false;
  return value.includes("/") && !value.startsWith("http");
};

const expandS3KeyVariants = (value) => {
  if (!value || typeof value !== "string") {
    return [];
  }

  const trimmed = value.trim();
  const variants = new Set([trimmed]);

  try {
    const decoded = decodeURIComponent(trimmed);
    variants.add(decoded);
    variants.add(decoded.replace(/\+/g, " "));
    variants.add(decoded.replace(/ /g, "+"));
  } catch {
    // Keep the raw value when URL decoding fails.
  }

  variants.add(trimmed.replace(/\+/g, " "));
  variants.add(trimmed.replace(/ /g, "+"));

  return [...variants].filter(Boolean);
};

export const getS3KeyCandidates = ({ s3Key, key, publicId, url } = {}) => {
  const candidates = [];
  const seen = new Set();

  const push = (value) => {
    for (const variant of expandS3KeyVariants(value)) {
      if (!seen.has(variant)) {
        seen.add(variant);
        candidates.push(variant);
      }
    }
  };

  push(s3Key);
  if (publicId && looksLikeS3Key(publicId)) {
    push(publicId);
  }
  push(key);

  const extractedFromUrl = extractS3KeyFromUrl(url);
  if (extractedFromUrl) {
    push(extractedFromUrl);
  }

  if (publicId && !looksLikeS3Key(publicId) && isS3MediaUrl(url)) {
    push(publicId);
  }

  return candidates;
};

export const resolveS3Key = (source = {}) => {
  const candidates = getS3KeyCandidates(source);
  return candidates[0] || null;
};

export const buildS3UrlFromKey = (s3Key, { mediaType = "image" } = {}) => {
  if (!s3Key) return null;

  const bucketName = resolveS3BucketName();
  const region = resolveS3Region();
  const encodedKey = encodeS3Url(s3Key);

  if (mediaType === "video") {
    const cloudfrontDomain = process.env.CLOUDFRONT_DOMAIN;
    if (cloudfrontDomain) {
      return `https://${cloudfrontDomain}/${encodedKey}`;
    }
  }

  if (!bucketName) return null;
  return `https://${bucketName}.s3.${region}.amazonaws.com/${encodedKey}`;
};

const buildUploadResult = (fileKey, url) => ({
  s3Key: fileKey,
  key: fileKey,
  url,
});

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
    
    return buildUploadResult(fileKey, url);
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
    
    return buildUploadResult(fileKey, url);
  } catch (error) {
    console.error(`❌ S3 video upload failed: ${fileKey}`);
    console.error(`🔍 Error details:`, error);
    throw error;
  }
};

export const extractS3KeyFromUrl = (url) => {
  if (!url || typeof url !== "string") {
    return null;
  }

  if (isLegacyExternalMediaUrl(url)) {
    return null;
  }

  try {
    const parsed = new URL(url);
    const host = parsed.hostname;
    const pathSegments = parsed.pathname.split("/").filter(Boolean);
    const decodePath = (segments) =>
      decodeURIComponent(segments.join("/")).replace(/\+/g, " ");

    const cloudfrontDomain = String(process.env.CLOUDFRONT_DOMAIN || "")
      .trim()
      .replace(/^https?:\/\//, "")
      .replace(/\/$/, "");

    if (cloudfrontDomain && host === cloudfrontDomain) {
      return decodePath(pathSegments);
    }

    if (host.includes("cloudfront.net") || host.includes("cloudfront")) {
      return decodePath(pathSegments);
    }

    if (host.includes(".s3.") && host.includes("amazonaws.com")) {
      return decodePath(pathSegments);
    }

    if (host === "s3.amazonaws.com" || /^s3[.-]/.test(host)) {
      if (pathSegments.length >= 2) {
        return decodePath(pathSegments.slice(1));
      }
    }

    if (url.includes("amazonaws.com")) {
      return decodePath(pathSegments);
    }
  } catch {
    // Fall through to string-based parsing.
  }

  if (url.includes("cloudfront.net") || url.includes("cloudfront")) {
    const key = url.split("/").slice(3).join("/");
    return key.replace(/\+/g, " ");
  }

  if (url.includes("s3.") && url.includes(".amazonaws.com")) {
    const key = url.split("/").slice(3).join("/");
    return key.replace(/\+/g, " ");
  }

  if (url.includes("s3.amazonaws.com")) {
    const key = url.split("/").slice(4).join("/") || url.split("/").slice(3).join("/");
    return key.replace(/\+/g, " ");
  }

  return null;
};

export const deleteMediaFromS3 = async (keyOrSource) => {
  const bucketName = resolveS3BucketName();
  if (!bucketName) {
    console.warn("⚠️ S3 bucket configuration is not defined; skipping deletion.");
    return;
  }

  const key =
    typeof keyOrSource === "string"
      ? keyOrSource
      : resolveS3Key(keyOrSource);

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

export const deleteVideoFromS3 = async (keyOrSource) => {
  try {
    const bucketName = resolveS3BucketName();
    if (!bucketName) {
      console.warn("⚠️ S3 bucket configuration is not defined; skipping video deletion.");
      return;
    }

    const key =
      typeof keyOrSource === "string"
        ? keyOrSource
        : resolveS3Key(keyOrSource);

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
    console.error(`❌ S3 video deletion failed: ${keyOrSource}`);
    console.error(`🔍 Error details:`, error);
    throw error;
  }
};

export const enrichSupportMaterial = (material = {}) => {
  const resolvedS3Key = resolveS3Key({
    s3Key: material.s3Key,
    key: material.key,
    publicId: material.publicId,
    url: material.url,
  });

  return {
    ...material,
    s3Key: resolvedS3Key || material.s3Key || material.key || "",
    url: resolveSupportMaterialUrl({
      ...material,
      s3Key: resolvedS3Key || material.s3Key || material.key || "",
    }),
  };
};

export const enrichLectureMedia = (lecture) => {
  if (!lecture) return lecture;

  const lectureObject = typeof lecture.toObject === "function" ? lecture.toObject() : { ...lecture };
  const resolvedS3Key = resolveS3Key({
    s3Key: lectureObject.s3Key,
    key: lectureObject.key,
    publicId: lectureObject.publicId,
    url: lectureObject.videoUrl,
  });

  lectureObject.s3Key =
    resolvedS3Key || lectureObject.s3Key || lectureObject.publicId || lectureObject.key || "";
  lectureObject.videoUrl = resolveLectureVideoUrl(lectureObject);

  if (Array.isArray(lectureObject.supportMaterials)) {
    lectureObject.supportMaterials = lectureObject.supportMaterials.map(enrichSupportMaterial);
  }

  return lectureObject;
};

export const isLocalMediaPath = (value) =>
  typeof value === "string" && value.startsWith("/") && !value.startsWith("//");

export const getPublicApiBase = () => {
  const configured =
    process.env.API_PUBLIC_BASE_URL ||
    process.env.REACT_APP_API_BASE_URL;

  if (configured && configured.includes("/api/v1")) {
    return configured.replace(/\/$/, "");
  }

  if (configured) {
    return `${configured.replace(/\/$/, "")}/api/v1`;
  }

  return `http://127.0.0.1:${process.env.PORT || 3081}/api/v1`;
};

export const buildMediaAssetUrl = (s3Key, legacy = {}) => {
  if (!s3Key) {
    return null;
  }

  const params = new URLSearchParams();
  params.set("key", s3Key);

  if (legacy.publicId) {
    params.set("publicId", legacy.publicId);
  }

  if (legacy.url) {
    params.set("url", legacy.url);
  }

  if (legacy.key) {
    params.set("legacyKey", legacy.key);
  }

  return `${getPublicApiBase()}/media/asset?${params.toString()}`;
};

const resolveMediaAssetUrl = ({ url, s3Key, key, publicId }) => {
  if (isLocalMediaPath(url)) {
    return url;
  }

  if (isLegacyExternalMediaUrl(url)) {
    return url;
  }

  const candidates = getS3KeyCandidates({ s3Key, key, publicId, url });
  if (candidates.length > 0) {
    return buildMediaAssetUrl(candidates[0], { s3Key, key, publicId, url });
  }

  if (url && !isS3MediaUrl(url)) {
    return url;
  }

  return url || null;
};

export const resolveSupportMaterialUrl = (material = {}) => {
  return resolveMediaAssetUrl({
    url: material.url,
    s3Key: material.s3Key,
    key: material.key,
    publicId: material.publicId,
  });
};

export const resolveLectureVideoUrl = (lecture = {}) => {
  return resolveMediaAssetUrl({
    url: lecture.videoUrl,
    s3Key: lecture.s3Key,
    key: lecture.key,
    publicId: lecture.publicId,
  });
};

export const resolveCourseThumbnailUrl = (course = {}) => {
  return resolveMediaAssetUrl({
    url: course.courseThumbnail,
    s3Key: course.courseThumbnailS3Key,
    key: course.courseThumbnailKey,
  });
};

export const resolveUserPhotoUrl = (user = {}) => {
  return resolveMediaAssetUrl({
    url: user.photoUrl,
    s3Key: user.photoS3Key,
    key: user.photoKey,
  });
};

const toPlainCourse = (course) => {
  if (!course) {
    return course;
  }

  if (typeof course.toObject !== "function") {
    return { ...course };
  }

  const plain = course.toObject();

  if (Array.isArray(course.lectures)) {
    plain.lectures = course.lectures.map((lecture) => {
      if (!lecture || typeof lecture !== "object") {
        return lecture;
      }

      return typeof lecture.toObject === "function" ? lecture.toObject() : lecture;
    });
  }

  return plain;
};

const enrichCourseLectures = (lectures = []) =>
  lectures.map((lecture) => {
    if (!lecture || typeof lecture !== "object") {
      return lecture;
    }

    return enrichLectureMedia(lecture);
  });

export const enrichCourseMedia = (course) => {
  if (!course) return course;

  const courseObject = toPlainCourse(course);
  const resolvedS3Key = resolveS3Key({
    s3Key: courseObject.courseThumbnailS3Key,
    url: courseObject.courseThumbnail,
  });

  courseObject.courseThumbnailS3Key = resolvedS3Key || courseObject.courseThumbnailS3Key || "";
  courseObject.courseThumbnail = resolveCourseThumbnailUrl(courseObject);

  if (Array.isArray(courseObject.lectures)) {
    courseObject.lectures = enrichCourseLectures(courseObject.lectures);
  }

  return courseObject;
};

export const enrichUserMedia = (user) => {
  if (!user) return user;

  const userObject = typeof user.toObject === "function" ? user.toObject() : { ...user };
  const resolvedS3Key = resolveS3Key({
    s3Key: userObject.photoS3Key,
    url: userObject.photoUrl,
  });

  userObject.photoS3Key = resolvedS3Key || userObject.photoS3Key || "";
  userObject.photoUrl = resolveUserPhotoUrl(userObject);

  return userObject;
};
