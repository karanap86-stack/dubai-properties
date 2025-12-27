// awsS3Service.js
// AWS S3 integration for free-tier file storage (uploads, downloads, signed URLs)
// Usage: For KYC, project docs, lead uploads, etc.

import AWS from 'aws-sdk';

const S3_BUCKET = process.env.AWS_S3_BUCKET || 'your-free-tier-bucket';
const REGION = process.env.AWS_REGION || 'us-east-1';

AWS.config.update({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: REGION,
});

const s3 = new AWS.S3();

// Upload a file (buffer or stream)
export async function uploadFile(key, body, contentType = 'application/octet-stream') {
  const params = {
    Bucket: S3_BUCKET,
    Key: key,
    Body: body,
    ContentType: contentType,
    ACL: 'public-read', // or 'private' for sensitive docs
  };
  return s3.upload(params).promise();
}

// Generate a signed URL for download (default 1 hour)
export function getSignedUrl(key, expiresIn = 3600) {
  const params = {
    Bucket: S3_BUCKET,
    Key: key,
    Expires: expiresIn,
  };
  return s3.getSignedUrl('getObject', params);
}

// Delete a file
export async function deleteFile(key) {
  const params = {
    Bucket: S3_BUCKET,
    Key: key,
  };
  return s3.deleteObject(params).promise();
}

export default { uploadFile, getSignedUrl, deleteFile };
