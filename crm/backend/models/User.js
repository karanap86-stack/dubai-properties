// User model for CRM (Mongoose schema example)
const mongoose = require('mongoose');
const { departments, roles } = require('../../shared/roles');
const { regions } = require('../../shared/regions');
const regionNames = regions.map(r => r.name);
const stateNames = regions.flatMap(r => r.states);

const userSchema = new mongoose.Schema({
  name: String,
  email: { type: String, unique: true },
  password: String, // hashed
  department: { type: String, enum: departments },
  role: { type: String, enum: roles },
  isAI: { type: Boolean, default: false },
  active: { type: Boolean, default: true },
  region: { type: String, enum: regionNames },
  state: { type: String, enum: stateNames }
});

module.exports = mongoose.model('User', userSchema);
