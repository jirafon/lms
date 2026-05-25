import { S3Client } from "@aws-sdk/client-s3";
import dotenv from "dotenv";

dotenv.config();

const getFirstDefinedEnv = (keys) => {
  for (const key of keys) {
    const value = process.env[key];
    if (value) {
      return value;
    }
  }

  return undefined;
};

export const resolveS3BucketName = () =>
  getFirstDefinedEnv(["S3_BUCKET_NAME", "REACT_APP_BUCKET", "AWS_BUCKET"]);

export const resolveS3Region = () =>
  getFirstDefinedEnv([
    "AWS_REGION",
    "AWS_DEFAULT_REGION",
    "REACT_APP_AWS_REGION",
    "REACT_APP_REGION",
  ]) || "sa-east-1";

export const createS3Client = () =>
  new S3Client({
    region: resolveS3Region(),
  });
