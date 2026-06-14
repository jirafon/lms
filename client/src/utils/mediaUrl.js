const API_BASE =
  process.env.REACT_APP_API_BASE_URL || "http://localhost:3010/api/v1";

export const isLocalMediaPath = (value) =>
  typeof value === "string" && value.startsWith("/") && !value.startsWith("//");

export const isS3MediaUrl = (url) => {
  if (!url || typeof url !== "string") {
    return false;
  }

  return (
    url.includes("s3") ||
    url.includes("cloudfront") ||
    url.includes("amazonaws.com")
  );
};

const extractS3KeyFromUrl = (url) => {
  if (!url || !isS3MediaUrl(url)) {
    return null;
  }

  try {
    const parsed = new URL(url);
    return decodeURIComponent(parsed.pathname.replace(/^\/+/, "")).replace(/\+/g, " ");
  } catch {
    const parts = url.split("/");
    return parts.slice(3).join("/").replace(/\+/g, " ");
  }
};

const buildMediaAssetUrl = (s3Key) => {
  if (!s3Key) {
    return null;
  }

  return `${API_BASE}/media/asset?key=${encodeURIComponent(s3Key)}`;
};

export const resolveCourseThumbnail = (course) => {
  if (!course) {
    return null;
  }

  const { courseThumbnail, courseThumbnailS3Key } = course;

  if (isLocalMediaPath(courseThumbnail)) {
    return courseThumbnail;
  }

  const resolvedS3Key =
    courseThumbnailS3Key || extractS3KeyFromUrl(courseThumbnail);

  if (resolvedS3Key) {
    return buildMediaAssetUrl(resolvedS3Key);
  }

  if (courseThumbnail && !isS3MediaUrl(courseThumbnail)) {
    return courseThumbnail;
  }

  return courseThumbnail || null;
};

export const resolveUserPhoto = (user) => {
  if (!user) {
    return null;
  }

  const { photoUrl, photoS3Key } = user;

  if (isLocalMediaPath(photoUrl)) {
    return photoUrl;
  }

  const resolvedS3Key = photoS3Key || extractS3KeyFromUrl(photoUrl);

  if (resolvedS3Key) {
    return buildMediaAssetUrl(resolvedS3Key);
  }

  return photoUrl || null;
};
