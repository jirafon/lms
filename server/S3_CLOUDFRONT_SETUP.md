# S3 and CloudFront Setup Guide

This guide will help you configure your LMS to use AWS S3 for video storage and CloudFront for content delivery.

## Prerequisites

1. AWS Account
2. AWS CLI configured (optional but recommended)
3. Node.js and npm installed

## Step 1: Create S3 Bucket

1. Go to AWS S3 Console
2. Create a new bucket with a unique name
3. Choose your preferred region
4. Configure bucket settings:
   - Block all public access: **Uncheck** (we'll use bucket policy)
   - Enable versioning: Optional
   - Enable server-side encryption: Recommended

## Step 2: Configure S3 Bucket Policy

Create a bucket policy to allow public read access for CloudFront:

```json
{
    "Version": "2012-10-17",
    "Statement": [
        {
            "Sid": "PublicReadGetObject",
            "Effect": "Allow",
            "Principal": "*",
            "Action": "s3:GetObject",
            "Resource": "arn:aws:s3:::YOUR-BUCKET-NAME/*"
        }
    ]
}
```

Replace `YOUR-BUCKET-NAME` with your actual bucket name.

## Step 3: Create CloudFront Distribution

1. Go to AWS CloudFront Console
2. Create a new distribution
3. Configure settings:
   - **Origin Domain**: Select your S3 bucket
   - **Origin Path**: Leave empty
   - **Origin ID**: Auto-generated
   - **Viewer Protocol Policy**: Redirect HTTP to HTTPS
   - **Allowed HTTP Methods**: GET, HEAD, OPTIONS
   - **Cache Policy**: CachingOptimized (or create custom)
   - **Origin Request Policy**: CORS-S3Origin
   - **Response Headers Policy**: CORS-CustomOrigin

4. Create the distribution and note the domain name

## Step 4: Configure Environment Variables

Add these variables to your `.env` file:

```env
# AWS S3 Configuration
AWS_ACCESS_KEY_ID=your_aws_access_key_id
AWS_SECRET_ACCESS_KEY=your_aws_secret_access_key
AWS_REGION=us-east-1
S3_BUCKET_NAME=your-s3-bucket-name

# CloudFront Configuration
CLOUDFRONT_DOMAIN=your-cloudfront-distribution-domain.cloudfront.net
```

## Step 5: Install Dependencies

Run this command in the server directory:

```bash
npm install @aws-sdk/client-s3
```

## Step 6: Test the Setup

1. Start your server
2. Try uploading a video through your LMS
3. Check that the video is stored in S3
4. Verify that the video URL uses CloudFront domain

## Security Considerations

1. **IAM Permissions**: Create a dedicated IAM user with minimal permissions:
   ```json
   {
       "Version": "2012-10-17",
       "Statement": [
           {
               "Effect": "Allow",
               "Action": [
                   "s3:PutObject",
                   "s3:GetObject",
                   "s3:DeleteObject"
               ],
               "Resource": "arn:aws:s3:::YOUR-BUCKET-NAME/*"
           }
       ]
   }
   ```

2. **CORS Configuration**: Add CORS configuration to your S3 bucket:
   ```json
   [
       {
           "AllowedHeaders": ["*"],
           "AllowedMethods": ["GET", "PUT", "POST", "DELETE"],
           "AllowedOrigins": ["*"],
           "ExposeHeaders": []
       }
   ]
   ```

## Troubleshooting

1. **Upload Failures**: Check AWS credentials and bucket permissions
2. **Video Not Playing**: Verify CloudFront distribution is deployed
3. **CORS Errors**: Ensure CORS is properly configured on S3 bucket
4. **403 Errors**: Check bucket policy and IAM permissions

## Migration from Cloudinary

If you're migrating from Cloudinary:
1. Existing videos will continue to work (fallback logic is in place)
2. New videos will be uploaded to S3
3. Consider migrating old videos to S3 for consistency 