// Document model for CRM (Mongoose schema)
const mongoose = require('mongoose');
const { departments } = require('../../shared/roles');
const { regions } = require('../../shared/regions');
const documentTypes = require('../documentTypes');

const regionNames = regions.map(r => r.name);
const stateNames = regions.flatMap(r => r.states);
const docTypeList = Object.values(documentTypes).flat();

const documentSchema = new mongoose.Schema({
  clientId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  uploadedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  department: { type: String, enum: departments },
  region: { type: String, enum: regionNames },
  state: { type: String, enum: stateNames },
  type: { type: String, enum: docTypeList },
  url: String, // S3 URL
  filename: String,
  accessLevel: { type: String, enum: ['private', 'department', 'admin', 'public'], default: 'private' },
  requestedBy: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  approvedBy: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  version: { type: Number, default: 1 },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Document', documentSchema);
