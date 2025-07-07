import { S3Client, GetBucketPolicyCommand, GetBucketAclCommand } from "@aws-sdk/client-s3";
import dotenv from 'dotenv';

dotenv.config();

const s3 = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});

async function checkS3Bucket() {
  const bucketName = process.env.S3_BUCKET_NAME;
  
  console.log('🔍 Checking S3 Bucket Configuration');
  console.log('===================================\n');
  
  console.log(`🪣 Bucket Name: ${bucketName}`);
  console.log(`🌍 Region: ${process.env.AWS_REGION}`);
  console.log(`🔑 Access Key: ${process.env.AWS_ACCESS_KEY_ID ? '✅ Set' : '❌ Missing'}`);
  console.log(`🔐 Secret Key: ${process.env.AWS_SECRET_ACCESS_KEY ? '✅ Set' : '❌ Missing'}\n`);
  
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
        "Resource": `arn:aws:s3:::${bucketName}/*`
      }
    ]
  }, null, 2));
  
  console.log('\n📋 Next Steps:');
  console.log('1. Go to AWS S3 Console');
  console.log(`2. Select bucket: ${bucketName}`);
  console.log('3. Go to "Permissions" tab');
  console.log('4. Add the bucket policy above');
  console.log('5. Make sure "Block public access" is disabled');
  console.log('6. Test video access again');
}

checkS3Bucket().catch(console.error); 