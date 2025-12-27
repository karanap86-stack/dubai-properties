// AWS S3 integration for CRM document storage
const AWS = require('aws-sdk');

const s3 = new AWS.S3({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.AWS_REGION || 'us-east-1'
});

const BUCKET = process.env.AWS_S3_BUCKET || 'your-crm-bucket';


// Upload document to S3 (supports versioning by default if enabled on bucket)
async function uploadDocument(fileBuffer, fileName, mimeType) {
  const params = {
    Bucket: BUCKET,
    Key: fileName,
    Body: fileBuffer,
    ContentType: mimeType,
    ACL: 'private'
  };
  try {
    const result = await s3.upload(params).promise();
    return result;
  } catch (e) {
    throw new Error('S3 upload failed: ' + e.message);
  }
}


// Get a signed URL for downloading a document
function getDocumentUrl(fileName, versionId = null) {
  const params = {
    Bucket: BUCKET,
    Key: fileName,
    Expires: 60 * 60 // 1 hour
  };
  if (versionId) params.VersionId = versionId;
  return s3.getSignedUrl('getObject', params);
}

// Download document (returns file buffer)
async function downloadDocument(fileName, versionId = null) {
  const params = {
    Bucket: BUCKET,
    Key: fileName
  };
  if (versionId) params.VersionId = versionId;
  try {
    const data = await s3.getObject(params).promise();
    return data.Body;
  } catch (e) {
    throw new Error('S3 download failed: ' + e.message);
  }
}

module.exports = { uploadDocument, getDocumentUrl, downloadDocument };
