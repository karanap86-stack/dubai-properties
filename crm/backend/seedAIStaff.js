// Script to seed initial AI staff for all departments (except Procurement/Product)
const mongoose = require('mongoose');
const User = require('./models/User');
const { departments } = require('../../shared/roles');
const { aiRoles, initialStaffing } = require('../../shared/aiRoles');

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/crm';

const excluded = ['Procurement', 'Product'];

async function seed() {
  await mongoose.connect(MONGO_URI);
  for (const dept of departments) {
    if (excluded.includes(dept)) continue;
    for (const role of aiRoles) {
      const count = initialStaffing[role] || 0;
      for (let i = 0; i < count; i++) {
        await User.create({
          name: `${role} ${dept} ${i+1}`,
          email: `${role.toLowerCase().replace(/ /g, '-')}-${dept.toLowerCase()}-${i+1}@ai.local`,
          password: 'AI_MANAGED',
          department: dept,
          role,
          isAI: true
        });
      }
    }
  }
  console.log('Seeded initial AI staff for all departments');
  process.exit();
}
seed();
