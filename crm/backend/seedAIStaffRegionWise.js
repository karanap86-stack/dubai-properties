// Script to seed AI staff for all departments, region and state wise
const mongoose = require('mongoose');
const User = require('./models/User');
const { departments } = require('../../shared/roles');
const { aiRoles, initialStaffing } = require('../../shared/aiRoles');
const { regions } = require('../../shared/regions');

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/crm';

const excluded = ['Procurement', 'Product'];

async function seed() {
  await mongoose.connect(MONGO_URI);
  for (const region of regions) {
    for (const state of region.states) {
      for (const dept of departments) {
        if (excluded.includes(dept)) continue;
        for (const role of aiRoles) {
          const count = initialStaffing[role] || 0;
          for (let i = 0; i < count; i++) {
            await User.create({
              name: `${role} ${dept} ${region.name} ${state} ${i+1}`,
              email: `${role.toLowerCase().replace(/ /g, '-')}-${dept.toLowerCase()}-${region.name.toLowerCase()}-${state.toLowerCase().replace(/ /g, '-')}-${i+1}@ai.local`,
              password: 'AI_MANAGED',
              department: dept,
              role,
              isAI: true,
              region: region.name,
              state: state
            });
          }
        }
      }
    }
  }
  console.log('Seeded AI staff for all departments, region and state wise');
  process.exit();
}
seed();
