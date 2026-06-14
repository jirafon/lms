const API_BASE =
  process.env.REACT_APP_API_BASE_URL || "http://localhost:3010/api/v1";

export const isLocalMediaPath = (value) =>
  typeof value === "string" && value.startsWith("/") && !value.startsWith("//");

export const isLegacyExternalMediaUrl = (url) => {
  if (!url || typeof url !== "string") {
    return false;
  }

  return url.includes("cloudinary.com") || url.includes("res.cloudinary");
};

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

export const looksLikeS3Key = (value) => {
  if (!value || typeof value !== "string") {
    return false;
  }

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

const extractS3KeyFromUrl = (url) => {
  if (!url || !isS3MediaUrl(url) || isLegacyExternalMediaUrl(url)) {
    return null;
  }

  try {
    const parsed = new URL(url);
    const host = parsed.hostname;
    const pathSegments = parsed.pathname.split("/").filter(Boolean);
    const decodePath = (segments) =>
      decodeURIComponent(segments.join("/")).replace(/\+/g, " ");

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

  if (url.includes("s3.") && url.includes(".amazonaws.com")) {
    return url.split("/").slice(3).join("/").replace(/\+/g, " ");
  }

  if (url.includes("s3.amazonaws.com")) {
    return (
      url.split("/").slice(4).join("/") || url.split("/").slice(3).join("/")
    ).replace(/\+/g, " ");
  }

  return null;
};

const getS3KeyCandidates = ({ s3Key, key, publicId, url } = {}) => {
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

const buildMediaAssetUrl = (s3Key, legacy = {}) => {
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

  return `${API_BASE}/media/asset?${params.toString()}`;
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

export const resolveCourseThumbnail = (course) => {
  if (!course) {
    return null;
  }

  return resolveMediaAssetUrl({
    url: course.courseThumbnail,
    s3Key: course.courseThumbnailS3Key,
    key: course.courseThumbnailKey,
  });
};

export const resolveUserPhoto = (user) => {
  if (!user) {
    return null;
  }

  return resolveMediaAssetUrl({
    url: user.photoUrl,
    s3Key: user.photoS3Key,
    key: user.photoKey,
  });
};

export const resolveLectureVideo = (lecture) => {
  if (!lecture) {
    return null;
  }

  return resolveMediaAssetUrl({
    url: lecture.videoUrl,
    s3Key: lecture.s3Key,
    key: lecture.key,
    publicId: lecture.publicId,
  });
};

export const resolveSupportMaterialUrl = (material) => {
  if (!material) {
    return null;
  }

  return resolveMediaAssetUrl({
    url: material.url,
    s3Key: material.s3Key,
    key: material.key,
    publicId: material.publicId,
  });
};

export const enrichLectureForClient = (lecture) => {
  if (!lecture) {
    return lecture;
  }

  const resolvedVideoUrl = resolveLectureVideo(lecture);
  const resolvedS3Key =
    lecture.s3Key ||
    (lecture.publicId && looksLikeS3Key(lecture.publicId) ? lecture.publicId : "") ||
    lecture.key ||
    "";

  return {
    ...lecture,
    s3Key: resolvedS3Key,
    videoUrl: resolvedVideoUrl,
    supportMaterials: Array.isArray(lecture.supportMaterials)
      ? lecture.supportMaterials.map((material) => ({
          ...material,
          url: resolveSupportMaterialUrl(material),
        }))
      : lecture.supportMaterials,
  };
};

export const enrichCourseForClient = (course) => {
  if (!course) {
    return course;
  }

  return {
    ...course,
    courseThumbnail: resolveCourseThumbnail(course),
    lectures: Array.isArray(course.lectures)
      ? course.lectures.map(enrichLectureForClient)
      : course.lectures,
  };
};
