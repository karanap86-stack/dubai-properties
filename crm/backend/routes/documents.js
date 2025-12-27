// Express routes for document upload, access, and request/approval
const express = require('express');
const router = express.Router();
const multer = require('multer');
const { uploadDocument, getDocumentUrl } = require('../s3');
const Document = require('../models/Document');
const User = require('../models/User');
const documentTypes = require('../documentTypes');

const upload = multer();

// Upload document
router.post('/upload', upload.single('file'), async (req, res) => {
  const { clientId, department, region, state, type, accessLevel } = req.body;
  const uploadedBy = req.user._id; // Assume auth middleware
  const file = req.file;
  if (!file) return res.status(400).json({ error: 'No file uploaded' });
  // Upload to S3
  const s3res = await uploadDocument(file.buffer, file.originalname, file.mimetype);
  // Save metadata
  const doc = await Document.create({
    clientId, uploadedBy, department, region, state, type, accessLevel,
    url: s3res.Location, filename: file.originalname
  });
  res.json(doc);
});

// Get document (with access check)
router.get('/:id', async (req, res) => {
  const doc = await Document.findById(req.params.id);
  if (!doc) return res.status(404).json({ error: 'Not found' });
  const user = req.user; // Assume auth middleware sets req.user
  // Access control logic
  let allowed = false;
  if (!user) return res.status(401).json({ error: 'Unauthorized' });
  if (doc.accessLevel === 'public') allowed = true;
  else if (doc.uploadedBy.equals(user._id)) allowed = true;
  else if (doc.accessLevel === 'department' && user.department === doc.department) allowed = true;
  else if (doc.accessLevel === 'admin' && user.role && user.role.toLowerCase().includes('admin')) allowed = true;
  else if (doc.accessLevel === 'private' && doc.approvedBy.includes(user._id)) allowed = true;
  if (!allowed) return res.status(403).json({ error: 'Access denied' });
  const url = getDocumentUrl(doc.filename);
  res.json({ url });
});

// Request document access
router.post('/:id/request', async (req, res) => {
  const doc = await Document.findById(req.params.id);
  if (!doc) return res.status(404).json({ error: 'Not found' });
  doc.requestedBy.push(req.user._id);
  await doc.save();
  res.json({ status: 'requested' });
});

// Approve document access
router.post('/:id/approve', async (req, res) => {
  const doc = await Document.findById(req.params.id);
  if (!doc) return res.status(404).json({ error: 'Not found' });
  doc.approvedBy.push(req.user._id);
  await doc.save();
  res.json({ status: 'approved' });
});

module.exports = router;
