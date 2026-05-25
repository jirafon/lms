import { GetBucketPolicyCommand, GetBucketAclCommand } from "@aws-sdk/client-s3";
import dotenv from 'dotenv';
import { createS3Client, resolveS3BucketName } from './utils/s3Config.js';

dotenv.config();

const s3 = createS3Client();

async function checkS3Bucket() {
  const bucketName = resolveS3BucketName();

  if (!bucketName) {
    console.error('❌ Missing S3 bucket configuration');
    return;
  }
  
  console.log('🔍 Checking S3 Bucket Configuration');
  console.log('===================================\n');
  
  try {
    // Check bucket ACL
    console.log('📋 Checking bucket ACL...');
    const aclCommand = new GetBucketAclCommand({ Bucket: bucketName });
    const aclResult = await s3.send(aclCommand);
    
    console.log('✅ Bucket ACL retrieved successfully');
    console.log(`   Owner: ${aclResult.Owner.DisplayName}`);
    console.log(`   Grants: ${aclResult.Grants.length} grants found`);
    
    // Check if there's a public read grant
    const publicReadGrant = aclResult.Grants.find(grant => 
      grant.Grantee.URI === 'http://acs.amazonaws.com/groups/global/AllUsers' &&
      grant.Permission === 'READ'
    );
    
    if (publicReadGrant) {
      console.log('✅ Public read access is enabled via ACL');
    } else {
      console.log('❌ Public read access is NOT enabled via ACL');
    }
    
  } catch (error) {
    console.log('❌ Could not retrieve bucket ACL:', error.message);
  }
  
  try {
    // Check bucket policy
    console.log('\n📋 Checking bucket policy...');
    const policyCommand = new GetBucketPolicyCommand({ Bucket: bucketName });
    const policyResult = await s3.send(policyCommand);
    
    console.log('✅ Bucket policy retrieved successfully');
    console.log('📄 Policy content:');
    console.log(JSON.stringify(JSON.parse(policyResult.Policy), null, 2));
    
  } catch (error) {
    if (error.name === 'NoSuchBucketPolicy') {
      console.log('❌ No bucket policy found');
      console.log('💡 You need to create a bucket policy for public read access');
    } else {
      console.log('❌ Error retrieving bucket policy:', error.message);
    }
  }
  
  console.log('\n🔧 Recommended Bucket Policy:');
  console.log(JSON.stringify({
    "Version": "2012-10-17",
    "Statement": [
      {
        "Sid": "PublicReadGetObject",
        "Effect": "Allow",
        "Principal": "*",
        "Action": "s3:GetObject",
        "Resource": "arn:aws:s3:::<bucket-name>/*"
      }
    ]
  }, null, 2));
  
  console.log('\n📋 Next Steps:');
  console.log('1. Go to AWS S3 Console');
  console.log('2. Select the configured bucket');
  console.log('3. Go to "Permissions" tab');
  console.log('4. Add the bucket policy above');
  console.log('5. Make sure "Block public access" is disabled');
  console.log('6. Test video access again');
}

checkS3Bucket().catch(console.error); 